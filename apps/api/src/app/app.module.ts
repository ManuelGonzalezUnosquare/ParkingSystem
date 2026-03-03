import { getDatabaseConfig } from '@database/data-source';
import { RaffleModule } from '@modules/raffle/raffle.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
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
import { RedisModule } from './redis.module';

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
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, 'REDIS_CLIENT'],
      useFactory: (config: ConfigService, redisClient: Redis) => {
        return {
          throttlers: [
            {
              name: 'short',
              ttl: 1000,
              limit: 5,
            },
            {
              name: 'medium',
              ttl: 60000,
              limit: config.get<number>('THROTTLER_LIMIT', 20),
            },
          ],
          storage: new ThrottlerStorageRedisService(redisClient),
        };
      },
    }),
    TypeOrmModule.forFeature([Building, Role, User]),
    ScheduleModule.forRoot(),
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
