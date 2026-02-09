import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ResetPasswordByCodeDto,
  ResetPasswordRequestDto,
} from './dtos';
import { SessionModel } from '@parking-system/libs';
import { Public, CurrentUser } from '@common/decorators';
import { User } from '@database/entities';
import { UsersService } from '@modules/users/services';

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

    return this.authService.login(user);
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return user;
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
    return this.authService.login(user);
  }

  @Public()
  @Post('validate-reset-code')
  async validateCode(@Body() payload: { code: string }) {
    const email = await this.authService.validateResetCode(payload.code);
    return email;
  }
}
