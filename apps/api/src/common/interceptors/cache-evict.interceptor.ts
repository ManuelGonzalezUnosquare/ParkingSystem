import { CacheEvictOptions } from '@common/decorators';
import { BuildingsCacheService } from '@modules/buildings/services';
import { RafflesCacheService } from '@modules/raffle/services';
import { UsersCacheService } from '@modules/users/services';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheEvictInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
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
        const { entity, isKeySpecific } = options;
        const id = request.params.id;
        const buildingId = request.params.buildingId || request.body.buildingId;

        let cacheService: any;

        try {
          if (entity === 'users')
            cacheService = this.moduleRef.get(UsersCacheService, {
              strict: false,
            });
          if (entity === 'buildings')
            cacheService = this.moduleRef.get(BuildingsCacheService, {
              strict: false,
            });
          if (entity === 'raffles')
            cacheService = this.moduleRef.get(RafflesCacheService, {
              strict: false,
            });
        } catch (error) {
          console.error(
            `❌ CacheEvictInterceptor: No se pudo encontrar el servicio para ${entity}`,
          );
          return;
        }

        if (!cacheService) return;

        if (entity === 'raffles' && buildingId) {
          await cacheService.invalidateRaffleData(buildingId);
        } else {
          await cacheService.invalidateAllLists();
          if (isKeySpecific && id) {
            if (entity === 'users') await cacheService.invalidateUser(id);
            if (entity === 'buildings')
              await cacheService.invalidateBuilding(id);
          }
        }
      }),
    );
  }
}
