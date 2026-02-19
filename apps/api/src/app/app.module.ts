import { getDatabaseConfig } from '@database/data-source';
import { RaffleModule } from '@modules/raffle/raffle.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building, Role, User } from '../database/entities';
import { DatabaseSeederService } from '../database/seeder.service';
import {
  AuthModule,
  BuildingsModule,
  SlotsModule,
  UsersModule,
  UtilsModule,
} from '../modules';
import { JwtAuthGuard, RolesGuard } from '../modules/auth/guards';
import { BuildingSubscriber } from '../subscribers/building.subscriber';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getDatabaseConfig(config),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // life time ms
        limit: 10,
      },
    ]),
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
      useClass: ThrottlerGuard,
    },

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
