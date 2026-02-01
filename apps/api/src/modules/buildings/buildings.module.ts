import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Building } from "../../database/entities";
import { BuildingsController } from "./buildings.controller";
import { BuildingsService } from "./buildings.service";

@Module({
  imports: [TypeOrmModule.forFeature([Building])],
  controllers: [BuildingsController],
  providers: [BuildingsService],
})
export class BuildingsModule {}
