import { User } from '@database/entities';
import { UsersService } from '@modules/users/services/users.service';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionModel, UserModel } from '@parking-system/libs';
import { CryptoService } from '@utils/services';
import { ResetPasswordByCodeDto } from './dtos';
import { generateSecureCode } from '@common/utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.cryptoService.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  login(user: UserModel): SessionModel {
    this.logger.log(`User logged in: ${user.email}`);
    const payload = {
      email: user.email,
      sub: user.publicId,
      role: user.role,
      buildingId: user.buildingId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateResetCode(code: string): Promise<string> {
    const email = await this.userService.findByResetCode(code);
    if (!email) throw new UnauthorizedException('Invalid or expired code');
    return email;
  }

  async resetPasswordRequest(email: string): Promise<string> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with ${email} not found.`);
    }

    const resetCode = generateSecureCode(8);
    try {
      await this.userService.internalUpdate(user.id, {
        passwordResetCode: resetCode,
      });

      this.logger.log(`Password reset code generated for: ${email}`);
      //TODO: implement email service call
      return resetCode;
    } catch (error) {
      this.logger.error(
        `Error generating reset code for ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error processing password reset');
    }
  }
  async resetPassword(dto: ResetPasswordByCodeDto, sessionUser?: User) {
    const { email, code, newPassword } = dto;

    if (!sessionUser) {
      const user = await this.userService.findOneByEmail(email);

      if (!user || user.passwordResetCode !== code) {
        throw new UnauthorizedException('Invalid email or reset code');
      }
      return this.changePassword(user, newPassword);
    }

    return this.changePassword(sessionUser, newPassword);
  }

  private async changePassword(user: User, newPassword: string) {
    const hashedPassword = await this.cryptoService.hash(newPassword);
    try {
      const response = await this.userService.internalUpdate(user.id, {
        requirePasswordChange: false,
        password: hashedPassword,
        passwordResetCode: null,
      });

      this.logger.log(`Password successfully changed for user id: ${user.id}`);
      //TODO: send confirmation email
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to change password for user ${user.id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update password');
    }
  }
}
