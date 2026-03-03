import { BaseModel } from './base.model';
import { UserModel } from './user.model';

export class BuildingModel extends BaseModel {
  name: string;
  totalSlots: number;
  address: string;
  createdBy?: UserModel;
}
