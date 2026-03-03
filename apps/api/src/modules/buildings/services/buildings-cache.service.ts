import { BaseCacheService, CACHE_KEYS } from '@common/cache';
import { SearchDto } from '@common/dtos';
import { PaginatedResult } from '@common/utils';
import { Building } from '@database/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BuildingsCacheService extends BaseCacheService {
  //single
  async getBuilding(id: string): Promise<Building | null> {
    return this.getDirect<Building>(CACHE_KEYS.BUILDING(id));
  }

  async setBuilding(id: string, data: Building): Promise<void> {
    await this.cacheManager.set(CACHE_KEYS.BUILDING(id), data, 3600); // 1 hour
  }

  async invalidateBuilding(id: string): Promise<void> {
    await Promise.all([
      this.cacheManager.del(CACHE_KEYS.BUILDING(id)),
      this.invalidateAllLists(),
    ]);
  }

  async getList(search: SearchDto): Promise<PaginatedResult<Building> | null> {
    return this.getDirect<PaginatedResult<Building>>(
      CACHE_KEYS.BUILDING_LIST(search),
    );
  }

  async setList(
    search: SearchDto,
    data: PaginatedResult<Building>,
  ): Promise<void> {
    const key = CACHE_KEYS.BUILDING_LIST(search);
    await this.redisClient.set(key, JSON.stringify(data), 'EX', 300);
  }

  async invalidateAllLists(): Promise<void> {
    await this.invalidateByPattern('buildings:list:*');
    console.log('🧹 Cache: Buildings lists cleared');
  }
}
