import { BaseModel } from './base.model';
import { SlotModel } from './slot.model';
import { UserModel } from './user.model';
import { VehicleModel } from './vehicle.model';

export class RaffleResultModel extends BaseModel {
  user: UserModel;
  vehicle: VehicleModel;
  slot: SlotModel;
  scoreAtDraw: number;
}
