import { paginateQuery, PermissionValidator } from '@common/utils';
import { RaffleResult, User } from '@database/entities';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { RaffleService } from './raffle.service';
import { SearchDto, SearchRaffleResultsDto } from '@common/dtos';

@Injectable()
export class RaffleResultsService {
  private readonly logger = new Logger(RaffleResultsService.name);

  constructor(
    @InjectRepository(RaffleResult)
    private readonly raffleResultRepository: Repository<RaffleResult>,
    private readonly raffleService: RaffleService,
  ) {}

  async findResultsByUser(filters: SearchDto, user: User) {
    const query = this.raffleResultRepository
      .createQueryBuilder('results')
      .leftJoinAndSelect('results.user', 'user')
      .leftJoinAndSelect('user.building', 'building')
      .leftJoinAndSelect('results.vehicle', 'vehicle')
      .leftJoinAndSelect('results.slot', 'slot')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('building.id = :buildingId', { buildingId: user.building.id });

    filters.sortOrder = -1;

    const result = await paginateQuery(query, filters);
    return result;
  }

  async findResultsByRaffle(filters: SearchRaffleResultsDto, user: User) {
    const { raffleId, globalFilter } = filters;
    const raffle = await this.raffleService.findByPublicId(raffleId);

    if (!raffle) {
      throw new NotFoundException('Not raffle found for this building');
    }

    PermissionValidator.validateBuildingAccess(user, raffle.building.publicId);

    const query = this.raffleResultRepository
      .createQueryBuilder('results')
      .leftJoinAndSelect('results.user', 'user')
      .leftJoinAndSelect('results.vehicle', 'vehicle')
      .leftJoinAndSelect('results.slot', 'slot')
      .where('results.raffle_id = :raffleId', { raffleId: raffle.id });

    if (globalFilter) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName LIKE :filter', {
            filter: `%${globalFilter}%`,
          })
            .orWhere('user.lastName LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('user.email LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('vehicle.description LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('vehicle.licensePlate LIKE :filter', {
              filter: `%${globalFilter}%`,
            })
            .orWhere('slot.slotNumber LIKE :filter', {
              filter: `%${globalFilter}%`,
            });
        }),
      );
    }

    if (filters.status) {
      query.andWhere('results.status = :status', { status: filters.status });
    }

    const result = await paginateQuery(query, filters);
    return result;
  }
}
