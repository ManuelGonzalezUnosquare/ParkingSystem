import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    const securityConfig = {
      secret: configService.get<string>('JWT_SECRET') || '',
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfig.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOneByPublicId(payload.sub);
    if (!user) {
      throw new UnauthorizedException('jwt:User not found');
    }

    return user;
  }
}
