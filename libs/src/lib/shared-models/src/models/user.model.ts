import { BaseModel } from "./base.model";
import { RoleModel } from "./role.model";

export interface UserModel extends BaseModel {
  email: string;
  role: RoleModel;
}
