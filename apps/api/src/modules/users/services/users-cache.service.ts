import { BaseCacheService, CACHE_KEYS } from '@common/cache';
import { User } from '@database/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersCacheService extends BaseCacheService {
  async getUser(id: string): Promise<User | null> {
    return this.getDirect<User>(CACHE_KEYS.USER(id));
  }

  async setUser(id: string, data: User): Promise<void> {
    await this.cacheManager.set(CACHE_KEYS.USER(id), data, 3600);
  }

  async getList<T = any>(search: any): Promise<T | null> {
    return this.getDirect<T>(CACHE_KEYS.USER_LIST(search));
  }

  async setList(search: any, data: any): Promise<void> {
    const key = CACHE_KEYS.USER_LIST(search);
    await this.redisClient.set(key, JSON.stringify(data), 'EX', 300);
  }

  async invalidateUser(id: string): Promise<void> {
    await Promise.all([
      this.cacheManager.del(CACHE_KEYS.USER(id)),
      this.invalidateAllLists(),
    ]);
  }

  async invalidateAllLists(): Promise<void> {
    await this.invalidateByPattern('users:list:*');
    console.log('🧹 Cache: Users lists cleared');
  }
}
