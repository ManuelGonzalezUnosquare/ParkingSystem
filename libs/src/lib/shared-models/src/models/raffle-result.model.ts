import { BaseModel } from './base.model';

export class RaffleResultModel extends BaseModel {
  raffleId: string;
  assignedDate: string;
  userName: string;
  userScoreAtDraw: number;
  vehicleDescription: string;
  vehiclePlate: string;
  slotNumber: string;
  status: string;
}
