import { ParkingSlot } from '@database/entities';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  constructor(
    @InjectRepository(ParkingSlot)
    private readonly slotRepository: Repository<ParkingSlot>,
  ) {}

  async findAllByBuilding(buildingPublicId: string): Promise<ParkingSlot[]> {
    this.logger.log(`Fetching all slots for building: ${buildingPublicId}`);

    return await this.slotRepository.find({
      where: { building: { publicId: buildingPublicId } },
      order: { slotNumber: 'ASC' },
    });
  }

  async findAvailableByBuilding(
    buildingPublicId: string,
  ): Promise<ParkingSlot[]> {
    return await this.slotRepository.find({
      where: {
        building: { publicId: buildingPublicId },
        isAvailable: true,
      },
      order: { slotNumber: 'ASC' },
    });
  }

  async findOneByPublicId(publicId: string): Promise<ParkingSlot> {
    const slot = await this.slotRepository.findOne({
      where: { publicId },
      relations: ['building'],
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID "${publicId}" not found`);
    }

    return slot;
  }
}
