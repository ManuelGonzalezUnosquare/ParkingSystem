import { SearchDto } from '@common/dtos';
import { PaginatedResult, paginateQuery } from '@common/utils';
import { Building, User } from '@database/entities';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuildingDto } from './dtos/create-building.dto';

@Injectable()
export class BuildingsService {
  private readonly logger = new Logger(BuildingsService.name);

  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  async create(dto: CreateBuildingDto, creator: User): Promise<Building> {
    const existing = await this.buildingRepository.findOneBy({
      name: dto.name,
    });

    if (existing) {
      throw new ConflictException(
        `Building with name "${dto.name}" already exists`,
      );
    }

    try {
      const newBuilding = this.buildingRepository.create({
        ...dto,
        createdBy: creator,
      });
      const saved = await this.buildingRepository.save(newBuilding);
      this.logger.log(`Building created: ${saved.publicId}`);
      return saved;
    } catch (error) {
      this.logger.error(
        `Failed to create building: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create building');
    }
  }

  async update(
    publicId: string,
    updateData: Partial<CreateBuildingDto>,
  ): Promise<Building> {
    const building = await this.findOneByPublicId(publicId);

    const updatedBuilding = this.buildingRepository.merge(building, updateData);

    try {
      return await this.buildingRepository.save(updatedBuilding);
    } catch (error) {
      this.logger.error(
        `Error updating building ${publicId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Error updating building record');
    }
  }

  async findAll(search: SearchDto): Promise<PaginatedResult<Building>> {
    const { globalFilter } = search;

    const query = this.buildingRepository.createQueryBuilder('building');

    if (globalFilter) {
      query.where(
        'building.name LIKE :filter OR building.address LIKE :filter',
        {
          filter: `%${globalFilter}%`,
        },
      );
    }

    return await paginateQuery(query, search);
  }

  async findOneByPublicId(publicId: string): Promise<Building> {
    const building = await this.buildingRepository.findOneBy({ publicId });
    if (!building) {
      this.logger.warn(`Building not found: ${publicId}`);
      throw new NotFoundException(`Building with ID "${publicId}" not found`);
    }
    return building;
  }

  async remove(publicId: string): Promise<void> {
    const building = await this.findOneByPublicId(publicId);

    try {
      await this.buildingRepository.softDelete(building.id);
      this.logger.log(`building ID: ${publicId} successfully removed`);
    } catch (error) {
      this.logger.error(
        `Failed to remove building ID: ${publicId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Could not remove building');
    }
  }
}
