import { Building } from '@database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingsController } from './buildings.controller';
import { BuildingsCacheService, BuildingsService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([Building])],
  controllers: [BuildingsController],
  providers: [BuildingsService, BuildingsCacheService],
  exports: [BuildingsService],
})
export class BuildingsModule {}
