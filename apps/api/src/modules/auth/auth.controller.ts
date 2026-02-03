import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, Session } from "@org/shared-models";
import { Public } from "../../common/decorators";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<Session> {
    // 1. Validate credentials
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );

    // 2. Generate and return the JWT
    return this.authService.login(user);
  }
}
