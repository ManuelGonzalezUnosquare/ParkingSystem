import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  create(createVehicleDto: CreateVehicleDto) {
    return 'This action adds a new vehicle';
  }

  update(id: number, updateVehicleDto: CreateVehicleDto) {
    return `This action updates a #${id} vehicle`;
  }

  remove(id: number) {
    return `This action removes a #${id} vehicle`;
  }
}
