import { BaseModel } from './base.model';

export class BuildingModel extends BaseModel {
  name: string;
  description: string;
  totalSlots: number;
  address: string;
}
