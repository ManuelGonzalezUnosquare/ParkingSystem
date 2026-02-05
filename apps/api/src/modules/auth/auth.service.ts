import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../utils/services';
import { SessionModel } from '@parking-system/libs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  /**
   * Validates user credentials by comparing email and hashed password.
   * @param email User's email address
   * @param pass Plain text password from login request
   * @returns User object (excluding password) if valid
   * @throws UnauthorizedException if credentials don't match
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.cryptoService.compare(pass, user.password);

    if (isMatch) {
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  /**
   * Signs a JWT for an authenticated user.
   * @param user Validated user object
   * @returns Access token and basic user info for the frontend
   */
  login(user: User): SessionModel {
    const payload = {
      email: user.email,
      sub: user.publicId,
      role: user.role?.name,
      buildingId: user.building?.publicId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
