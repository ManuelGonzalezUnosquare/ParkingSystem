import { Raffle, RaffleResult } from '@database/entities';
import { UsersModule } from '@modules/users/users.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleController, RaffleResultsController } from './controllers';
import { RaffleCron } from './raffle.cron';
import {
  RaffleResultsService,
  RafflesCacheService,
  RaffleService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Raffle, RaffleResult]),
    UsersModule,
    VehiclesModule,
  ],
  controllers: [RaffleController, RaffleResultsController],
  providers: [
    RaffleService,
    RafflesCacheService,
    RaffleCron,
    RaffleResultsService,
  ],
})
export class RaffleModule {}
