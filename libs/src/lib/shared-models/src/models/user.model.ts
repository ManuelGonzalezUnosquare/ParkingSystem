import { BaseModel } from './base.model';

export interface UserModel extends BaseModel {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  priorityScore: number;
  isActive: boolean;
  requirePasswordChange: boolean;

  buildingId?: string;
  buildingName?: string;

  hasVehicle: boolean;
  hasSlot: boolean;
  vehicleDescription?: string;
  vehiclePlate?: string;
  assignedSlotNumber?: string;
}
