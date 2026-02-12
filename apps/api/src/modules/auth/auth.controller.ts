import { CurrentUser, Public } from '@common/decorators';
import { User } from '@database/entities';
import { UsersService } from '@modules/users/services';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SessionModel } from '@parking-system/libs';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ResetPasswordByCodeDto,
  ResetPasswordRequestDto,
} from './dtos';
import { UserEntityToModel } from '@modules/users/mappers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<SessionModel> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    return this.authService.login(UserEntityToModel(user));
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return UserEntityToModel(user);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: { newPassword: string },
    @CurrentUser() user: User,
  ) {
    const response = await this.userService.changePassword(
      dto.newPassword,
      user,
    );
    return UserEntityToModel(response);
  }

  @Public()
  @Post('reset-password-request')
  @HttpCode(HttpStatus.OK)
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return await this.userService.resetPasswordRequest(dto.email);
  }

  @Public()
  @Post('reset-password-confirm')
  @HttpCode(HttpStatus.OK)
  async resetPasswordConfirm(@Body() dto: ResetPasswordByCodeDto) {
    const user = await this.userService.resetPassword(dto);
    return this.authService.login(UserEntityToModel(user));
  }

  @Public()
  @Post('validate-reset-code')
  async validateCode(@Body() payload: { code: string }) {
    const email = await this.authService.validateResetCode(payload.code);
    return email;
  }
}
