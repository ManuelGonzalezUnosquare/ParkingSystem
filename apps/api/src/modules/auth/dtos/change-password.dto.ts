import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: '****' })
  @IsNotEmpty()
  @MinLength(7)
  newPassword: string;
}
