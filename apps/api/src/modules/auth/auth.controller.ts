import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../../database/entities';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { SessionModel } from '@parking-system/libs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<SessionModel> {
    // 1. Validate credentials
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    // 2. Generate and return the JWT
    return this.authService.login(user);
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return { data: user }; // El decorador que creamos ya tiene la info del token
  }
}
