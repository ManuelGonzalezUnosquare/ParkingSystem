import { BaseModel } from './base.model';

export class BuildingModel extends BaseModel {
  name: string;
  totalSlots: number;
  address: string;
}
