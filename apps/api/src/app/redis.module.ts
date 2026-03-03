import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import Redis from 'ioredis';

@Global() // <--- ¡Crucial para que otros módulos lo vean!
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const envRedisHost = config.get<string>('REDIS_HOST', 'redis');
        const dbHost = config.get<string>('DB_HOST', 'localhost');

        const finalHost =
          (dbHost === 'localhost' || dbHost === '127.0.0.1') &&
          envRedisHost === 'redis'
            ? 'localhost'
            : envRedisHost;

        return {
          store: await redisStore({
            socket: {
              host: finalHost,
              port: config.get<number>('REDIS_PORT', 6379),
            },
            ttl: config.get<number>('REDIS_TTL', 600),
          }),
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'], // <--- ¡Crucial para que sea inyectable fuera!
})
export class RedisModule {}
