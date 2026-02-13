import { CurrentUser, Public } from '@common/decorators';
import { User } from '@database/entities';
import { UserEntityToModel } from '@modules/users/mappers';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionModel } from '@parking-system/libs';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  LoginDto,
  ResetPasswordByCodeDto,
  ResetPasswordRequestDto,
} from './dtos';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto): Promise<SessionModel> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    return this.authService.login(UserEntityToModel(user));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: User) {
    return UserEntityToModel(user);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    const response = await this.authService.resetPassword(
      { newPassword: dto.newPassword, code: '', email: user.email },
      user,
    );
    return UserEntityToModel(response);
  }

  @Public()
  @Post('reset-password-request')
  @HttpCode(HttpStatus.OK)
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return await this.authService.resetPasswordRequest(dto.email);
  }

  @Public()
  @Post('reset-password-confirm')
  @HttpCode(HttpStatus.OK)
  async resetPasswordConfirm(@Body() dto: ResetPasswordByCodeDto) {
    const user = await this.authService.resetPassword(dto);
    return this.authService.login(UserEntityToModel(user));
  }

  @Public()
  @Post('validate-reset-code')
  async validateCode(@Body() payload: { code: string }) {
    const email = await this.authService.validateResetCode(payload.code);
    return email;
  }
}
