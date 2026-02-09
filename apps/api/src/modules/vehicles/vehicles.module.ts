import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
