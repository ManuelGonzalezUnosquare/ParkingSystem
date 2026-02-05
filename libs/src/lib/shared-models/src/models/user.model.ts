import { BaseModel } from './base.model';
import { RoleModel } from './role.model';

export interface UserModel extends BaseModel {
  firstName: string;
  lastName: string;
  status: string;
  email: string;
  role: RoleModel;
}
