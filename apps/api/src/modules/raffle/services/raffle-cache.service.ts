import { BaseCacheService, CACHE_KEYS } from '@common/cache';
import { Raffle, RaffleResult } from '@database/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RafflesCacheService extends BaseCacheService {
  async getNextByBuilding(buildingId: string): Promise<Raffle | null> {
    return this.getDirect(CACHE_KEYS.RAFFLE_NEXT(buildingId));
  }

  async setNextByBuilding(buildingId: string, data: any): Promise<void> {
    await this.cacheManager.set(CACHE_KEYS.RAFFLE_NEXT(buildingId), data, 1800);
  }

  async getHistory(
    buildingId: string,
    search: any,
  ): Promise<RaffleResult[] | null> {
    return this.getDirect(CACHE_KEYS.RAFFLE_HISTORY(buildingId, search));
  }

  async setHistory(
    buildingId: string,
    search: any,
    data: any[],
  ): Promise<void> {
    const key = CACHE_KEYS.RAFFLE_HISTORY(buildingId, search);
    await this.redisClient.set(key, JSON.stringify(data), 'EX', 600); // 10 min
  }

  async getBuildingList(
    buildingId: string,
    search: any,
  ): Promise<Raffle[] | null> {
    return this.getDirect(CACHE_KEYS.RAFFLE_BUILDING_LIST(buildingId, search));
  }

  async setBuildingList(
    buildingId: string,
    search: any,
    data: any[],
  ): Promise<void> {
    const key = CACHE_KEYS.RAFFLE_BUILDING_LIST(buildingId, search);
    await this.redisClient.set(key, JSON.stringify(data), 'EX', 300); // 5 min
  }

  async invalidateRaffleData(buildingId: string): Promise<void> {
    const patterns = [
      `raffles:next:building:${buildingId}`,
      `raffles:history:building:${buildingId}:*`,
      `raffles:list:building:${buildingId}:*`,
    ];

    await Promise.all(
      patterns.map((pattern) => this.invalidateByPattern(pattern)),
    );

    console.log(`🧹 Cache: Data for building ${buildingId} invalidated`);
  }

  // async getRaffle(id: string): Promise<Raffle | null> {
  //   return this.getDirect<Raffle>(CACHE_KEYS.RAFFLE(id));
  // }
  //
  // async setRaffle(id: string, data: Raffle): Promise<void> {
  //   await this.cacheManager.set(CACHE_KEYS.RAFFLE(id), data, 1800); // 30 min para sorteos
  // }
  //
  // async getList(search: any): Promise<PaginatedResult<Raffle> | null> {
  //   return this.getDirect(CACHE_KEYS.RAFFLE_LIST(search));
  // }
  //
  // async setList(search: any, data: any): Promise<void> {
  //   const key = CACHE_KEYS.RAFFLE_LIST(search);
  //   await this.redisClient.set(key, JSON.stringify(data), 'EX', 300);
  // }
  //
  // async invalidateRaffle(id: string): Promise<void> {
  //   await Promise.all([
  //     this.cacheManager.del(CACHE_KEYS.RAFFLE(id)),
  //     this.invalidateAllLists(),
  //   ]);
  // }
  //
  // async invalidateAllLists(): Promise<void> {
  //   await this.invalidateByPattern('raffles:list:*');
  // }
}
