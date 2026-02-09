import { ApiProperty } from '@nestjs/swagger';
import { IResetPasswordByCode } from '@parking-system/libs';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordByCodeDto implements IResetPasswordByCode {
  @ApiProperty({ example: 'admin@parking.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
