import { UserStatusEnum } from "../../enums";

export class ICreateUser {
  email: string;

  password: string; //TODO: review this

  firstName: string;

  lastName: string;

  status: UserStatusEnum;
}
