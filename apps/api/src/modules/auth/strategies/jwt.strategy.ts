import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "TU_JWT_SECRET_SUPER_SECRETO", // Debe ser el mismo del módulo
    });
  }

  // Lo que retorne este método se inyectará en el objeto 'req.user'
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      buildingId: payload.buildingId,
    };
  }
}
