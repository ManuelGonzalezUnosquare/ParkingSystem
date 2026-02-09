import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { User, Vehicle } from '@database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    dto: CreateVehicleDto,
    targetUser: User,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Vehicle)
      : this.vehicleRepository;
    const vehicle = repo.create({
      ...dto,
      user: targetUser,
    });
    return await repo.save(vehicle);
  }

  async update(
    id: number,
    data: Partial<Vehicle>,
    manager?: EntityManager,
  ): Promise<Vehicle> {
    const repo = manager
      ? manager.getRepository(Vehicle)
      : this.vehicleRepository;
    await repo.update(id, data);
    return repo.findOneBy({ id });
  }

  async remove(id: number) {
    return await this.vehicleRepository.softDelete(id);
  }
}
