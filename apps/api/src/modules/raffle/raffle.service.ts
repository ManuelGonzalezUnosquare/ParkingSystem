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
import { RoleEnum, UserStatusEnum } from '@parking-system/libs';
import { DataSource, Equal, In, IsNull, Repository } from 'typeorm';

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

  async executeRaffle(user: User, isManuallyTriggered: boolean) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. Fetch Raffle and Building context
      const raffle = await queryRunner.manager.findOne(Raffle, {
        where: { building: Equal(user.building.id), executedAt: IsNull() },
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

      const activeCandidates = candidates.filter((u) => u.vehicles?.length > 0);
      const results = this.runSelection(activeCandidates, slots);

      //handle winners
      if (results.winners.length > 0) {
        const winnerIds = results.winners.map((w) => w.user.id);
        const vehicleIds = results.winners.map((w) => w.user.vehicles[0].id);

        await queryRunner.manager.update(User, winnerIds, { priorityScore: 0 });

        const historyRecords = results.winners.map((res) =>
          queryRunner.manager.create(RaffleResult, {
            raffle,
            user: res.user,
            vehicle: res.user.vehicles[0],
            slot: res.slot,
            scoreAtDraw: res.user.priorityScore,
          }),
        );
        await queryRunner.manager.save(RaffleResult, historyRecords);

        for (const res of results.winners) {
          await queryRunner.manager.update(Vehicle, res.user.vehicles[0].id, {
            slot: res.slot,
          });
        }
      }
      //handle lossers
      if (results.losers.length > 0) {
        const loserIds = results.losers.map((l) => l.id);
        await queryRunner.manager.increment(
          User,
          { id: In(loserIds) },
          'priorityScore',
          1,
        );

        const loserVehicleIds = results.losers.map((l) => l.vehicles[0].id);
        await queryRunner.manager.update(Vehicle, loserVehicleIds, {
          slot: null,
        });
      }

      //create next
      raffle.executedAt = new Date();
      raffle.isManual = isManuallyTriggered;
      await queryRunner.manager.save(raffle);

      const nextRaffle = queryRunner.manager.create(Raffle, {
        building: raffle.building,
        executionDate: this.calculateNextRaffleDate(),
      });
      await queryRunner.manager.save(nextRaffle);

      await queryRunner.commitTransaction();
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
