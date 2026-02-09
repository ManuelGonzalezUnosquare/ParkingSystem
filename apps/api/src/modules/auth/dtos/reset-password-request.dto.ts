import { ApiProperty } from '@nestjs/swagger';
import { IResetPasswordRequest } from '@parking-system/libs';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordRequestDto implements IResetPasswordRequest {
  @ApiProperty({ example: 'admin@parking.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;
}
