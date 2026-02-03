import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../../common/decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no roles are defined, the route is accessible (but still requires JWT)
    if (!requiredRoles) {
      return true;
    }

    // 2. Get the user from the request (injected by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 3. Check if user has at least one of the required roles
    const hasRole = requiredRoles.some((role) => user.role?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        "You do not have permission to access this resource"
      );
    }

    return true;
  }
}
