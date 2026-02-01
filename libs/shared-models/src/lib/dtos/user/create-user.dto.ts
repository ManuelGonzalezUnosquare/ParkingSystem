import { UserStatusEnum } from "../../enums";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}
