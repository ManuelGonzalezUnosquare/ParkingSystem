import { User } from '@database/entities';
import { UserModel, UserStatusEnum } from '@parking-system/libs';

export function UserEntityToModel(user: User): UserModel {
  const primaryVehicle = user.vehicles?.[0] || null;
  return {
    publicId: user.publicId,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role.name,
    requirePasswordChange: user.requirePasswordChange,
    buildingId: user.building?.publicId,
    buildingName: user.building?.name,
    priorityScore: user.priorityScore,
    isActive: user.status === UserStatusEnum.ACTIVE,
    hasVehicle: !!primaryVehicle,
    hasSlot: !!primaryVehicle?.slot,
    vehicleDescription: primaryVehicle?.description || 'No vehicle',
    vehiclePlate: primaryVehicle?.licensePlate || 'N/A',
    assignedSlotNumber: primaryVehicle?.slot?.slotNumber || 'None',
  };
}
