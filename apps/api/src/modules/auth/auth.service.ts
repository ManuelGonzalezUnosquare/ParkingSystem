import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { CryptoService } from "../utils/services";
import { User } from "../../database/entities";
import { Session } from "@org/shared-models";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private cryptoService: CryptoService
  ) {}

  /**
   * Validates user credentials by comparing email and hashed password.
   * @param email User's email address
   * @param pass Plain text password from login request
   * @returns User object (excluding password) if valid
   * @throws UnauthorizedException if credentials don't match
   */
  async validateUser(email: string, pass: string): Promise<Partial<User>> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await this.cryptoService.compare(pass, user.password);

    if (isMatch) {
      return user;
    }

    throw new UnauthorizedException("Invalid credentials");
  }

  /**
   * Signs a JWT for an authenticated user.
   * @param user Validated user object
   * @returns Access token and basic user info for the frontend
   */
  login(user: Partial<User>): Session {
    const payload = {
      email: user.email,
      sub: user.publicId,
      role: user.role?.publicId,
      buildingId: user.building?.publicId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.publicId!,
        email: user.email!,
        role: user.role!.publicId!,
        buildingId: user.building?.publicId,
      },
    };
  }
}
