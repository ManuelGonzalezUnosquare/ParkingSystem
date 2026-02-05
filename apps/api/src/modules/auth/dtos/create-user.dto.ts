import { ApiProperty } from '@nestjs/swagger';
import { ICreateUser, UserStatusEnum } from '@parking-system/libs';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateUserDto implements ICreateUser {
  @ApiProperty({ example: 'admin@parking.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
    default: UserStatusEnum.ACTIVE,
  })
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}
