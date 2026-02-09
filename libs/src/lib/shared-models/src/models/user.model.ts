import { BaseModel } from './base.model';
import { BuildingModel } from './building.model';
import { RoleModel } from './role.model';
import { VehicleModel } from './vehicle.model';

export interface UserModel extends BaseModel {
  firstName: string;
  lastName: string;
  status: string;
  email: string;
  role: RoleModel;
  building: BuildingModel;
  vehicles: VehicleModel[];
}
