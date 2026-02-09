import { BaseModel } from './base.model';
import { VehicleModel } from './vehicle.model';

export interface SlotModel extends BaseModel {
  slotNumber: string;
  isAvailable: boolean;
  vehicle?: VehicleModel;
}
