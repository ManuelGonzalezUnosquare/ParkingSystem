import { SetMetadata } from '@nestjs/common';

export type CacheEntity = 'users' | 'buildings' | 'raffles';

export interface CacheEvictOptions {
  entity: CacheEntity;
  isKeySpecific?: boolean;
}

export const CacheEvict = (options: CacheEvictOptions) =>
  SetMetadata('cache_evict', options);
