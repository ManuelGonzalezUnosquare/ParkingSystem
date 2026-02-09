import { BaseModel } from './base.model';
import { SlotModel } from './slot.model';

export interface VehicleModel extends BaseModel {
  licensePlate: string;
  description: string;
  slot?: SlotModel;
}
