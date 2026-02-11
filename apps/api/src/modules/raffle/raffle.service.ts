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
import { DataSource, Equal, IsNull, Repository } from 'typeorm';

@Injectable()
export class RaffleService {
  private readonly logger = new Logger(RaffleService.name);
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    private readonly dataSource: DataSource,
    private userService: UsersService,
  ) {}

  async findAll(user: User) {
    const buildingId = user.building.id;

    const query = this.raffleRepository
      .createQueryBuilder('raffles')
      .leftJoinAndSelect('raffles.results', 'results')
      .leftJoinAndSelect('results.user', 'users')
      .leftJoinAndSelect('results.vehicle', 'vehicle')
      .leftJoinAndSelect('results.slot', 'slot')
      .leftJoin('raffles.building', 'building')
      .where('building.Id = :buildingId', { buildingId });

    return query.getMany();
  }

  async executeRaffle(user: User, isManuallyTriggered: boolean) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let raffleId = null;
    try {
      // 1. Fetch Raffle and Building context
      const raffle = await queryRunner.manager.findOne(Raffle, {
        where: { building: Equal(user.building.id), executedAt: IsNull() },
        relations: [
          'building',
          'building.users',
          'building.users.vehicles',
          'building.users.role',
          'building.slots',
        ],
      });

      if (!raffle) {
        throw new Error('Raffle not found or already executed');
      }

      raffleId = raffle.id;
      this.logger.log(`Starting transaction for raffle ID: ${raffleId}`);

      // 2. Identify Candidates (Active Users with at least one vehicle)
      const candidates = raffle.building.users.filter(
        (u) =>
          u.role.name === RoleEnum.USER &&
          u.status === UserStatusEnum.ACTIVE &&
          u.vehicles?.length > 0,
      );

      // 3. Identify  Slots (Sorted by slotNumber)
      const availableSlots = raffle.building.slots
        // .filter((s) => s.isAvailable)
        .sort((a, b) =>
          a.slotNumber.localeCompare(b.slotNumber, undefined, {
            numeric: true,
          }),
        );

      // 4. Run Selection Algorithm
      const results = this.runSelection(candidates, availableSlots);

      // 5. Apply Changes via Transaction Manager
      for (const res of results.winners) {
        // Reset Priority Score
        await queryRunner.manager.update(User, res.user.id, {
          priorityScore: 0,
        });

        // Link Slot to Vehicle (Primary Vehicle)
        const primaryVehicle = res.user.vehicles[0];
        await queryRunner.manager.update(Vehicle, primaryVehicle.id, {
          slot: res.slot,
        });

        // Save History Record
        const history = queryRunner.manager.create(RaffleResult, {
          raffle,
          user: res.user,
          vehicle: primaryVehicle,
          slot: res.slot,
          scoreAtDraw: res.user.priorityScore,
        });
        await queryRunner.manager.save(history);
      }

      // 6. Handle Losers (Increment Priority)
      for (const loser of results.losers) {
        await queryRunner.manager.increment(
          User,
          { id: loser.id },
          'priorityScore',
          1,
        );

        // Ensure no previous slot is linked to their vehicles
        const primaryVehicle = loser.vehicles[0];
        await queryRunner.manager.update(Vehicle, primaryVehicle.id, {
          slot: null,
        });
      }

      // 7. Mark Raffle as executed and schedule next one
      raffle.executedAt = new Date();
      raffle.isManual = isManuallyTriggered;
      await queryRunner.manager.save(raffle);

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 3);
      const nextRaffle = queryRunner.manager.create(Raffle, {
        building: raffle.building,
        executionDate: nextDate,
      });
      await queryRunner.manager.save(nextRaffle);

      // COMMIT everything
      await queryRunner.commitTransaction();
      this.logger.log(
        `Raffle ${raffle.id} successfully executed and committed.`,
      );
    } catch (err) {
      // ROLLBACK if anything fails
      this.logger.error(
        `Raffle ${raffleId} failed. Rolling back changes.`,
        err.stack,
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the runner
      await queryRunner.release();
    }

    ////validate user role
    //const building = user.building;
    //const raffle = await this.findActiveRaffleByBuilding(building.id);
    //
    //const candidates = raffle.building.users.filter(
    //  (u) =>
    //    u.role.name === RoleEnum.USER &&
    //    u.status === UserStatusEnum.ACTIVE &&
    //    u.vehicles.length > 0,
    //);
    //
    //const availableSlots = raffle.building.slots
    //  .filter((s) => s.isAvailable)
    //  .sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
    //
    //let assignments = [];
    //
    //// less candidates than slots
    //if (candidates.length <= availableSlots.length) {
    //  assignments = candidates.map((user, index) => ({
    //    user,
    //    slot: availableSlots[index],
    //  }));
    //} else {
    //  // more candidates than slots
    //  assignments = this.runWeightedRaffle(candidates, availableSlots);
    //}
    //
    //return await this.finalizeRaffle(raffle, assignments, candidates, user);
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

  private runWeightedRaffle(candidates: User[], slots: ParkingSlot[]) {
    const winners = [];
    const pool = [...candidates];
    const totalSlots = slots.length;

    for (let i = 0; i < totalSlots; i++) {
      // Calcular pesos: 1 (base) + priorityScore
      const weightedPool = pool.flatMap((user) =>
        Array(user.priorityScore + 1).fill(user),
      );

      const winner =
        weightedPool[Math.floor(Math.random() * weightedPool.length)];
      winners.push({ user: winner, slot: slots[i] });

      // Sacar al ganador del pool para el siguiente slot
      const index = pool.indexOf(winner);
      pool.splice(index, 1);
    }

    return winners;
  }

  private async finalizeRaffle(
    raffle: Raffle,
    assignments: any[],
    allCandidates: User[],
  ) {
    // 1. Marcar ganadores (priorityScore se mantiene en 0 o se resetea)
    for (const a of assignments) {
      await this.userService.internalUpdate(a.user.id, {
        priorityScore: 0,
      });
    }

    // 2. Incrementar score de perdedores
    const winnersIds = assignments.map((a) => a.user.id);
    const losers = allCandidates.filter((c) => !winnersIds.includes(c.id));

    for (const loser of losers) {
      await this.userService.incrementPriority(loser.id);
    }

    // 3. Marcar rifa como ejecutada
    raffle.executedAt = new Date();
    await this.raffleRepository.save(raffle);

    // 4. CREAR LA SIGUIENTE RIFA (Automática en 3 meses)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 3);
    await this.raffleRepository.create({
      building: raffle.building,
      executionDate: nextDate,
    });
  }
}
