import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsersCacheService } from '@modules/users/services/users-cache.service';
import { BuildingsCacheService } from '@modules/buildings/services/buildings-cache.service';
import { CacheEvictOptions } from '@common/decorators';
import { RafflesCacheService } from '@modules/raffle/services';

@Injectable()
export class CacheEvictInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private usersCache: UsersCacheService,
    private buildingsCache: BuildingsCacheService,
    private rafflesCache: RafflesCacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.get<CacheEvictOptions>(
      'cache_evict',
      context.getHandler(),
    );

    return next.handle().pipe(
      tap(async () => {
        if (!options) return;

        const request = context.switchToHttp().getRequest();
        const id = request.params.publicId;
        const { entity, isKeySpecific } = options;

        const services = {
          users: this.usersCache,
          buildings: this.buildingsCache,
          raffles: this.rafflesCache,
        };

        if (entity === 'raffles') {
          const buildingId =
            request.params.buildingId || request.body.buildingId;

          if (buildingId) {
            await this.rafflesCache.invalidateRaffleData(buildingId);
          } else {
            await this.rafflesCache.invalidateRaffleData('raffles:*');
          }
        } else {
          const targetService = services[entity];
          if (!targetService) return;

          await targetService.invalidateAllLists();

          if (isKeySpecific && id) {
            if (entity === 'users') await this.usersCache.invalidateUser(id);
            if (entity === 'buildings')
              await this.buildingsCache.invalidateBuilding(id);
          }
        }

        console.log(
          `♻️ Cache Evicted: ${entity} ${id ? `(ID: ${id})` : '(Lists only)'}`,
        );
      }),
    );
  }
}
