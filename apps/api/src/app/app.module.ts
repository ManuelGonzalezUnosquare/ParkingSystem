import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Building,
  ParkingSlot,
  PasswordResetToken,
  Raffle,
  RaffleResult,
  Role,
  User,
  Vehicle,
} from '../database/entities';
import { DatabaseSeederService } from '../database/seeder.service';
import {
  AuthModule,
  BuildingsModule,
  SlotsModule,
  UsersModule,
  UtilsModule,
} from '../modules';
import { BuildingSubscriber } from '../subscribers/building.subscriber';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '../modules/auth/guards';
import { RaffleModule } from '@modules/raffle/raffle.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = {
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          user: config.get<string>('DB_USER'),
        };
        console.log('Tentando conexión a DB con:', dbConfig);
        return {
          type: 'mysql',
          host: dbConfig.host,
          port: parseInt(config.get<string>('DB_PORT', '3307'), 10),
          username: dbConfig.user,
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
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
    TypeOrmModule.forFeature([Building, Role, User]),
    AuthModule,
    UsersModule,
    BuildingsModule,
    SlotsModule,
    UtilsModule,
    RaffleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BuildingSubscriber,
    DatabaseSeederService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
