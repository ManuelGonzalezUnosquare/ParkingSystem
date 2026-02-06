import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Building } from '../../database/entities';
import { CreateBuildingDto } from './dtos/create-building.dto';
import { paginate, PaginatedResult } from '../../common/utils';
import { SearchDto } from '../../common/dtos';

@Injectable()
export class BuildingsService {
  private readonly logger = new Logger(BuildingsService.name);

  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  async create(dto: CreateBuildingDto): Promise<Building> {
    this.logger.log(`Creating building: ${dto.name}`);

    const existing = await this.buildingRepository.findOneBy({
      name: dto.name,
    });
    if (existing) {
      throw new ConflictException(
        `Building with name "${dto.name}" already exists`,
      );
    }

    try {
      const newBuilding = this.buildingRepository.create(dto);
      return await this.buildingRepository.save(newBuilding);
    } catch (error) {
      this.logger.error(`Error creating building: ${error.message}`);
      throw new InternalServerErrorException('Failed to create building');
    }
  }

  async update(
    publicId: string,
    updateData: Partial<CreateBuildingDto>,
  ): Promise<Building> {
    this.logger.log(`Attempting to update building ID: ${publicId}`);

    const building = await this.findOneByPublicId(publicId);

    if (!building) {
      this.logger.warn(`Building with ID: ${publicId} not found`);
      throw new NotFoundException(`Building with ID "${publicId}" not found`);
    }

    const updatedBuilding = Object.assign(building, updateData);

    try {
      const saved = await this.buildingRepository.save(updatedBuilding);
      this.logger.log(`Building ID: ${publicId} successfully updated`);
      return saved;
    } catch (error) {
      this.logger.error(
        `Error updating building ID: ${publicId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Error updating building record');
    }
  }

  async findAll(search: SearchDto): Promise<PaginatedResult<Building>> {
    const { globalFilter } = search;

    const queryOptions: any = {};

    if (globalFilter) {
      queryOptions.where = [
        { name: Like(`%${globalFilter}%`) },
        { address: Like(`%${globalFilter}%`) },
      ];
    }

    return await paginate(this.buildingRepository, search, queryOptions);
  }

  async findOneByPublicId(publicId: string): Promise<Building> {
    const building = await this.buildingRepository.findOneBy({ publicId });
    if (!building) {
      throw new NotFoundException(`Building with ID "${publicId}" not found`);
    }
    return building;
  }

  async remove(publicId: string): Promise<void> {
    this.logger.log(`Initiating removal for building ID: ${publicId}`);
    const building = await this.findOneByPublicId(publicId);

    if (!building) {
      this.logger.warn(`Building with ID: ${publicId} not found`);
      throw new NotFoundException(`Building with ID "${publicId}" not found`);
    }

    try {
      await this.buildingRepository.softDelete({ publicId });
      this.logger.log(`building ID: ${publicId} successfully removed`);
    } catch (error) {
      this.logger.error(
        `Failed to remove building ID: ${publicId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Could not remove building');
    }
  }
}
