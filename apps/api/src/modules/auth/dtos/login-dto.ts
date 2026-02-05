import { ILogin } from '@parking-system/libs';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto implements ILogin {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
