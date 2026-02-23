import { PermissionValidator } from '@common/utils';
import {
  ParkingSlot,
  Raffle,
  RaffleResult,
  User,
  Vehicle,
} from '@database/entities';
import { UsersService } from '@modules/users/services';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RoleEnum,
  UserRaffleResultEnum,
  UserStatusEnum,
} from '@parking-system/libs';
import { Between, DataSource, Equal, IsNull, Repository } from 'typeorm';
import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class RaffleService {
  private readonly logger = new Logger(RaffleService.name);
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    @InjectRepository(RaffleResult)
    private readonly raffleResultRepository: Repository<RaffleResult>,
    private readonly dataSource: DataSource,
    private userService: UsersService,
  ) {}

  async findNext(user: User) {
    const buildingId = user.building.id;
    return await this.raffleRepository.findOne({
      where: {
        executedAt: IsNull(),
        building: { id: buildingId },
      },
      relations: { building: true },
    });
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
  async findHistory(user: User) {
    const buildingId = user.building.id;
    const _buildingId =
      user.role.name === RoleEnum.ROOT ? buildingId : user.building.publicId;
    const userId = user.id;

    const query = this.raffleResultRepository
      .createQueryBuilder('results')
      .leftJoinAndSelect('results.raffle', 'raffle')
      .leftJoinAndSelect('results.user', 'users')
      .leftJoinAndSelect('results.vehicle', 'vehicle')
      .leftJoinAndSelect('results.slot', 'slot')
      .leftJoinAndSelect('results.executedBy', 'exBy')
      .leftJoin('raffle.building', 'building')
      .where('building.publicId = :_buildingId', { _buildingId })
      .andWhere('users.id = :userId', { userId })
      .orderBy('results.createdAt', 'DESC');

    return query.getMany();
  }

  async findAll(user: User, buildingId: string) {
    PermissionValidator.validateBuildingAccess(user, buildingId);

    const _buildingId =
      user.role.name === RoleEnum.ROOT ? buildingId : user.building.publicId;

    const query = this.raffleRepository
      .createQueryBuilder('raffles')
      .leftJoinAndSelect('raffles.results', 'results')
      .leftJoinAndSelect('results.user', 'users')
      .leftJoinAndSelect('results.vehicle', 'vehicle')
      .leftJoinAndSelect('results.slot', 'slot')
      .leftJoin('raffles.building', 'building')
      .where('building.publicId = :_buildingId', { _buildingId });

    return await query.getMany();
  }

  async executeRaffleManually(user: User) {
    PermissionValidator.validateBuildingAccess(
      user,
      user.building?.publicId || '',
      false,
    );

    const raffle = await this.raffleRepository.findOne({
      where: { building: Equal(user.building.id), executedAt: IsNull() },
      relations: ['building'],
    });

    return this.executeRaffle(user, true, raffle.id);
  }

  async executeRaffleAutomatically(user: User, raffleId: number) {
    return this.executeRaffle(user, false, raffleId);
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
      // 1. Fetch Raffle and Building context
      const raffle = await queryRunner.manager.findOne(Raffle, {
        where: { id: Equal(raffleId) },
        relations: ['building'],
      });

      if (!raffle) {
        throw new Error('Raffle not found or already executed');
      }

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
      const updatedData = {
        executedAt: new Date(),
        isManual: isManuallyTriggered,
        executedBy: isManuallyTriggered ? user : null,
      };
      await queryRunner.manager.update(Raffle, raffle.id, updatedData);

      const nextRaffle = queryRunner.manager.create(Raffle, {
        building: raffle.building,
        executionDate: this.calculateNextRaffleDate(),
      });
      await queryRunner.manager.save(nextRaffle);

      await queryRunner.commitTransaction();
      return raffle;
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
