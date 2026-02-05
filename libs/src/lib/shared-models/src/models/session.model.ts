import { UserModel } from "./user.model";

export class SessionModel {
  access_token: string;
  user: UserModel;
}
