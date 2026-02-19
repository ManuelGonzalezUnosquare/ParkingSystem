import { User } from '@database/entities';
import { ForbiddenException } from '@nestjs/common';
import { RoleEnum } from '@parking-system/libs';

export class PermissionValidator {
  /**
   * Validates if the user has access to the requested building.
   * Root users bypass this check automatically.
   */
  static validateBuildingAccess(
    user: User,
    targetPublicId: string,
    allowRoot = true,
  ): void {
    const isRoot = user.role.name === RoleEnum.ROOT;
    const isOwner = user.building?.publicId === targetPublicId;

    if (isRoot && !allowRoot) {
      throw new ForbiddenException('Target building unauthorized.');
    }

    if (!isRoot && !user.building) {
      throw new ForbiddenException('Target building unknown.');
    }

    if (!isRoot && !isOwner) {
      throw new ForbiddenException('Target building unauthorized.');
    }
  }
}
