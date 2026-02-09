import { ApiProperty } from '@nestjs/swagger';
import { ICreateVehicle } from '@parking-system/libs';
import { IsString } from 'class-validator';

export class CreateVehicleDto implements ICreateVehicle {
  @ApiProperty({ example: 'AKB-12-521' })
  @IsString()
  licensePlate: string;
  @ApiProperty({ example: '2016 Volkswagen Touareg – V6 3.0TDI - Red' })
  @IsString()
  description: string;
}
