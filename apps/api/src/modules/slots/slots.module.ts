import { Module } from "@nestjs/common";
import { SlotsService } from "./slots.service";
import { SlotsController } from "./slots.controller";
import { ParkingSlot } from "../../database/entities";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSlot])],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
