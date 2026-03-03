import { SearchDto } from '@common/dtos';
import { PermissionValidator } from '@common/utils';
import {
  ParkingSlot,
  Raffle,
  RaffleResult,
  User,
  Vehicle,
} from '@database/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RaffleHistoryModel,
  RaffleStatusEnum,
  RoleEnum,
  UserRaffleResultEnum,
  UserStatusEnum,
} from '@parking-system/libs';
import { endOfDay, startOfDay } from 'date-fns';
import { Between, DataSource, Equal, IsNull, Repository } from 'typeorm';
import { RafflesCacheService } from './raffle-cache.service';

interface ExecutionResult {
  executed: Raffle;
  upcoming: Raffle;
}

@Injectable()
export class RaffleService {
  private readonly logger = new Logger(RaffleService.name);
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    private readonly dataSource: DataSource,
    private readonly cacheService: RafflesCacheService,
  ) {}

  async findByPublicId(publicId: string) {
    return this.raffleRepository.findOne({
      where: {
        publicId,
      },
      relations: ['building'],
    });
  }

  async findNext(buildingId: string, user: User) {
    PermissionValidator.validateBuildingAccess(user, buildingId);
    return await this.raffleRepository.findOne({
      where: {
        executedAt: IsNull(),
        building: { publicId: buildingId },
      },
      relations: { building: true },
    });
  }

  async findHistory(buildingId: string, user: User, filters: SearchDto) {
    PermissionValidator.validateBuildingAccess(user, buildingId);
    const _buildingId =
      user.role.name === RoleEnum.ROOT ? buildingId : user.building.publicId;

    const first = filters.first || 0;
    const rows = filters.rows || 10;

    const userId = user.id;

    const query = this.raffleRepository
      .createQueryBuilder('raffles')
      .select([
        'raffles.publicId as publicId',
        'raffles.executionDate as plannedDate',
        'raffles.executedAt as executedDate',
        'building.totalSlots as availableSpots',
        'raffles.status as status',
        'raffles.isManual as isManual',
        'exBy.firstName as executedBy',
      ])
      .addSelect(
        "CAST(SUM(CASE WHEN results.status = 'WINNER' THEN 1 ELSE 0 END) AS SIGNED)",
        'winnersCount',
      )
      .addSelect(
        "CAST(SUM(CASE WHEN results.status = 'LOSER' THEN 1 ELSE 0 END) AS SIGNED)",
        'losersCount',
      )
      .addSelect(
        "CAST(SUM(CASE WHEN results.status = 'EXCLUDED_NO_VEHICLE' THEN 1 ELSE 0 END) AS SIGNED)",
        'excludedCount',
      )
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(res.id)')
          .from('raffle_results', 'res')
          .where(
            'res.raffle_id = raffles.id AND res.status IN (:...pStatuses)',
            {
              pStatuses: ['WINNER', 'LOSER'],
            },
          );
      }, 'totalParticipants')
      .leftJoin('raffles.results', 'results')
      .leftJoin('raffles.building', 'building')
      .leftJoin('raffles.executedBy', 'exBy')
      .where('building.publicId = :_buildingId', { _buildingId })
      .andWhere('raffles.status != :_status', {
        _status: RaffleStatusEnum.PLANNED,
      })
      .groupBy('raffles.id')
      .orderBy('raffles.executedAt', 'DESC')
      .limit(rows)
      .offset(rows * first);

    const total = await this.raffleRepository
      .createQueryBuilder('raffles')
      .leftJoin('raffles.building', 'building')
      .where('building.publicId = :_buildingId', { _buildingId })
      .getCount();

    const rawResults = await query.getRawMany();

    const data = rawResults.map<RaffleHistoryModel>((raw) => ({
      publicId: raw.publicId,
      plannedDate: raw.plannedDate,
      executedDate: raw.executedDate,
      availableSpots: raw.availableSpots,
      status: raw.status,
      isManual:
        raw.isManual === 1 || raw.isManual === '1' || raw.isManual === true,
      executedBy: raw.executedBy || '--',
      winnersCount: parseInt(raw.winnersCount || '0', 10),
      losersCount: parseInt(raw.losersCount || '0', 10),
      excludedCount: parseInt(raw.excludedCount || '0', 10),
      totalParticipants: parseInt(raw.totalParticipants || '0', 10),
      createdAt: raw.createdAt,
    }));

    return {
      data,
      meta: {
        total,
        page: Math.floor(first / rows) + 1,
        lastPage: Math.ceil(total / rows),
        limit: rows,
      },
    };
  }

  async executeRaffleManually(
    buildingId: string,
    user: User,
  ): Promise<ExecutionResult> {
    PermissionValidator.validateBuildingAccess(user, buildingId, false);

    const raffle = await this.raffleRepository.findOne({
      where: { building: Equal(user.building.id), executedAt: IsNull() },
    });

    return await this.executeRaffle(user, true, raffle.id);
  }

  async executeRaffleAutomatically(user: User, raffleId: number) {
    return this.executeRaffle(user, false, raffleId);
  }

  async findRafflesToExecuteToday() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    return await this.raffleRepository.find({
      where: {
        executionDate: Between(startOfToday, endOfToday),
        executedAt: IsNull(),
      },
      relations: { building: true },
    });
  }

  private async executeRaffle(
    user: User,
    isManuallyTriggered: boolean,
    raffleId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let buildingId = '';
      // 1. Fetch Raffle and Building context
      const raffle = await queryRunner.manager.findOne(Raffle, {
        where: { id: Equal(raffleId) },
        relations: ['building'],
      });

      if (!raffle) {
        throw new Error('Raffle not found or already executed');
      }

      buildingId = raffle.building.publicId;

      const [candidates, slots] = await Promise.all([
        queryRunner.manager.find(User, {
          where: {
            building: { id: raffle.building.id },
            status: UserStatusEnum.ACTIVE,
            role: { name: RoleEnum.USER },
          },
          relations: ['vehicles'],
        }),
        queryRunner.manager.find(ParkingSlot, {
          where: { building: { id: raffle.building.id } },
          order: { slotNumber: 'ASC' },
        }),
      ]);

      //clean old raffle assignations
      //
      const allVehiclesInBuilding = await queryRunner.manager.find(Vehicle, {
        where: { user: { building: { id: raffle.building.id } } },
      });

      if (allVehiclesInBuilding.length > 0) {
        const allVehicleIds = allVehiclesInBuilding.map((v) => v.id);
        await queryRunner.manager.update(Vehicle, allVehicleIds, {
          slot: null,
        });
      }

      const activeCandidates = candidates.filter((u) => u.vehicles?.length > 0);
      const excludedUsers = candidates.filter(
        (u) => !u.vehicles || u.vehicles.length === 0,
      );

      const selection = this.runSelection(activeCandidates, slots);

      const historyRecords: RaffleResult[] = [];

      //winners
      if (selection.winners.length > 0) {
        for (const res of selection.winners) {
          // Resetear prioridad y asignar slot al vehículo
          await queryRunner.manager.update(User, res.user.id, {
            priorityScore: 0,
          });
          await queryRunner.manager.update(Vehicle, res.user.vehicles[0].id, {
            slot: res.slot,
          });

          historyRecords.push(
            queryRunner.manager.create(RaffleResult, {
              raffle,
              user: res.user,
              vehicle: res.user.vehicles[0],
              slot: res.slot,
              scoreAtDraw: res.user.priorityScore,
              status: UserRaffleResultEnum.WINNER,
            }),
          );
        }
      }

      //loosers
      if (selection.losers.length > 0) {
        for (const loser of selection.losers) {
          await queryRunner.manager.increment(
            User,
            { id: loser.id },
            'priorityScore',
            1,
          );
          await queryRunner.manager.update(Vehicle, loser.vehicles[0].id, {
            slot: null,
          });

          historyRecords.push(
            queryRunner.manager.create(RaffleResult, {
              raffle,
              user: loser,
              vehicle: loser.vehicles[0],
              slot: null,
              scoreAtDraw: loser.priorityScore,
              status: UserRaffleResultEnum.LOSER,
            }),
          );
        }
      }
      //excluded
      for (const excluded of excludedUsers) {
        historyRecords.push(
          queryRunner.manager.create(RaffleResult, {
            raffle,
            user: excluded,
            vehicle: null,
            slot: null,
            scoreAtDraw: excluded.priorityScore,
            status: UserRaffleResultEnum.EXCLUDED_NO_VEHICLE,
          }),
        );
      }

      if (historyRecords.length > 0) {
        await queryRunner.manager.save(RaffleResult, historyRecords);
      }

      //create next

      raffle.executedAt = new Date();
      raffle.isManual = isManuallyTriggered;
      raffle.executedBy = isManuallyTriggered ? user : null;
      raffle.status = RaffleStatusEnum.COMPLETED;

      const executedRaffle = await queryRunner.manager.save(Raffle, raffle);

      const nextRaffle = queryRunner.manager.create(Raffle, {
        building: raffle.building,
        executionDate: this.calculateNextRaffleDate(),
      });
      const upcomingRaffle = await queryRunner.manager.save(nextRaffle);

      await queryRunner.commitTransaction();

      return {
        executed: executedRaffle,
        upcoming: upcomingRaffle,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  private calculateNextRaffleDate(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d;
  }
  private runSelection(
    candidates: User[],
    slots: ParkingSlot[],
  ): { winners: { user: User; slot: ParkingSlot }[]; losers: User[] } {
    const winners: { user: User; slot: ParkingSlot }[] = [];
    const totalSlots = slots.length;

    // CASE A: Everyone gets a spot
    if (candidates.length <= totalSlots) {
      this.logger.log(
        `Scenario A: Assigning slots directly to all ${candidates.length} candidates.`,
      );

      candidates.forEach((user, index) => {
        winners.push({ user, slot: slots[index] });
      });

      return { winners, losers: [] };
    }

    // CASE B: Weighted Lottery (More candidates than slots)
    this.logger.log(
      `Scenario B: Running weighted lottery for ${candidates.length} candidates and ${totalSlots} slots.`,
    );

    const pool = [...candidates];
    const activeSlots = [...slots];
    const finalWinners: { user: User; slot: ParkingSlot }[] = [];

    for (let i = 0; i < totalSlots; i++) {
      // 1. Calculate total weight of the current pool
      // Each user has 1 base chance + their priorityScore
      const totalWeight = pool.reduce(
        (acc, user) => acc + (user.priorityScore + 1),
        0,
      );

      // 2. Pick a random number between 0 and totalWeight
      let randomNumber = Math.random() * totalWeight;
      let selectedIndex = -1;

      // 3. Find which user "owns" that random number in the distribution
      for (let j = 0; j < pool.length; j++) {
        const userWeight = pool[j].priorityScore + 1;
        if (randomNumber < userWeight) {
          selectedIndex = j;
          break;
        }
        randomNumber -= userWeight;
      }

      // 4. Assign the winner to the current slot
      const winner = pool.splice(selectedIndex, 1)[0];
      const slot = activeSlots.shift()!; // Get the next slot in order (S-001, S-002...)

      finalWinners.push({ user: winner, slot });
    }

    return {
      winners: finalWinners,
      losers: pool, // The remaining users in the pool are the losers
    };
  }

  async findActiveRaffleByBuilding(buildingId: number) {
    return this.raffleRepository.findOne({
      where: {
        building: Equal(buildingId),
        executedAt: IsNull(),
      },
      relations: ['building', 'building.users', 'building.slots'],
    });
  }
}
