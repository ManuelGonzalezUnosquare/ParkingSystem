import { User } from '@database/entities';
import { UnauthorizedException } from '@nestjs/common';
import { RoleEnum } from '@parking-system/libs';

export class PermissionValidator {
  /**
   * Validates if the user has access to the requested building.
   * Root users bypass this check automatically.
   */
  static validateBuildingAccess(user: User, targetPublicId: string): void {
    const isRoot = user.role.name === RoleEnum.ROOT;
    const isOwner = user.building?.publicId === targetPublicId;

    if (!isRoot && !user.building) {
      throw new UnauthorizedException('Target building unknown.');
    }

    if (!isRoot && !isOwner) {
      throw new UnauthorizedException('Target building unauthorized.');
    }
  }
}
