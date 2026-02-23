import { Module } from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { RaffleController } from './raffle.controller';
import { Raffle, RaffleResult } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@modules/users/users.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { RaffleCron } from './raffle.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([Raffle, RaffleResult]),
    UsersModule,
    VehiclesModule,
  ],
  controllers: [RaffleController],
  providers: [RaffleService, RaffleCron],
})
export class RaffleModule {}
