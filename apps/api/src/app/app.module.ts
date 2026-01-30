import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { DatabaseSeederService } from "./database/seeder.service";
import { BuildingSubscriber } from "./subscribers/building.subscriber";
import { Role } from "./database/entities/role.entity";
import { User } from "./database/entities/user.entity";
import { Building } from "./database/entities/building.entity";
import {
  ParkingSlot,
  PasswordResetToken,
  Raffle,
  RaffleResult,
  Vehicle,
} from "./database/entities";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = {
          host: config.get<string>("DB_HOST"),
          port: config.get<number>("DB_PORT"),
          user: config.get<string>("DB_USER"),
        };
        console.log("Tentando conexión a DB con:", dbConfig);
        return {
          type: "mysql",
          host: config.get<string>("DB_HOST"),
          port: parseInt(config.get<string>("DB_PORT", "3307"), 10),
          username: config.get<string>("DB_USER"),
          password: config.get<string>("DB_PASSWORD"),
          database: config.get<string>("DB_NAME"),
          autoLoadEntities: true,
          synchronize: true,
          entities: [
            User,
            Building,
            Role,
            Vehicle,
            PasswordResetToken,
            Raffle,
            ParkingSlot,
            RaffleResult,
          ],
        };
      },
    }),
    TypeOrmModule.forFeature([Role, User, Building]),
  ],
  controllers: [AppController],
  providers: [AppService, BuildingSubscriber, DatabaseSeederService],
})
export class AppModule {}
