import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

export abstract class BaseCacheService {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    @Inject('REDIS_CLIENT') protected readonly redisClient: Redis,
  ) {}

  protected async invalidateByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
      cursor = nextCursor;
    } while (cursor !== '0');
  }

  protected async getDirect<T>(key: string): Promise<T | null> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) return cached;

    const raw = await this.redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  }
}
