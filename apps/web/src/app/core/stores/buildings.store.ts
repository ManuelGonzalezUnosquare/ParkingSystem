import {
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, effect, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  ApiPaginationMeta,
  BuildingModel,
  ICreateBuilding,
  Search,
} from '@parking-system/libs';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';
import { BuildingService } from '../../features/buildings/services/building.service';
import { FeedbackService } from '@core/services';
import { AuthStore } from './auth.store';

const bConfig = entityConfig({
  entity: type<BuildingModel>(),
  selectId: (building: BuildingModel) => building.publicId,
});

export const BuildingsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('buildings'),
  withReset(),
  withEntities(bConfig),
  withCallState(),
  withState({
    pagination: null as ApiPaginationMeta | null,
  }),
  withProps(() => ({
    _buildingService: inject(BuildingService),
    _feedbackService: inject(FeedbackService),
  })),
  withComputed((store) => ({
    isLoading: computed(() => {
      return store.callState() === 'loading';
    }),
  })),
  withMethods((store) => ({
    loadAll: rxMethod<Search>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((dto) =>
          store._buildingService.getAll(dto).pipe(
            tapResponse({
              next: (response) =>
                patchState(store, setAllEntities(response.data, bConfig), {
                  callState: 'loaded',
                  pagination: response.meta,
                }),
              error: (err: any) =>
                patchState(store, {
                  callState: {
                    error: err.error?.message || 'Load buildings failed',
                  },
                }),
            }),
          ),
        ),
      ),
    ),
    create: async (dto: ICreateBuilding): Promise<boolean> => {
      patchState(store, { callState: 'loading' });
      try {
        const response = await lastValueFrom(
          store._buildingService.create(dto),
        );
        patchState(store, addEntity(response.data, bConfig), {
          callState: 'loaded',
        });
        store._feedbackService.showSuccess(
          'Building Created',
          `${response.data.name} has been registered.`,
        );
        return true;
      } catch (err: any) {
        patchState(store, {
          callState: { error: err.error?.message || 'Create building failed' },
        });
        return false;
      }
    },
    update: async (id: string, dto: ICreateBuilding): Promise<boolean> => {
      patchState(store, { callState: 'loading' });
      try {
        const response = await lastValueFrom(
          store._buildingService.update(id, dto),
        );
        patchState(
          store,
          updateEntity({ id, changes: response.data }, bConfig),
          {
            callState: 'loaded',
          },
        );
        store._feedbackService.showSuccess(
          'Building Updated',
          `${response.data.name} has been updated.`,
        );

        return true;
      } catch (err: any) {
        const errorMsg = err.error?.message || 'Update failed';
        patchState(store, { callState: { error: errorMsg } });
        return false;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      patchState(store, { callState: 'loading' });
      try {
        await lastValueFrom(store._buildingService.delete(id));
        patchState(store, removeEntity(id), { callState: 'loaded' });
        return true;
      } catch (err: any) {
        patchState(store, {
          callState: { error: err.error?.message || 'Delete failed' },
        });
        return false;
      }
    },
  })),
  withHooks((store) => {
    const authStore = inject(AuthStore);
    return {
      onInit: (): void => {
        effect(() => {
          const isLoggedIn = authStore.isAuthenticated();
          if (!isLoggedIn) {
            store.resetState();
          }
        });
      },
    };
  }),
);
