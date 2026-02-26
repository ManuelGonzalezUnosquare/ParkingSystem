import { Raffle, RaffleResult } from '@database/entities';
import { UsersModule } from '@modules/users/users.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleController } from './raffle.controller';
import { RaffleCron } from './raffle.cron';
import { RafflesCacheService, RaffleService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Raffle, RaffleResult]),
    UsersModule,
    VehiclesModule,
  ],
  controllers: [RaffleController],
  providers: [RaffleService, RafflesCacheService, RaffleCron],
})
export class RaffleModule {}
