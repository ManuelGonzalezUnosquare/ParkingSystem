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
  withComputed,
  withFeature,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { BuildingModel } from '@parking-system/libs';
import { pipe, switchMap, tap } from 'rxjs';
import { BuildingService } from '../../features/buildings/services/building.service';
import { AuthStore } from './auth.store';
import { withBuildingRaffles } from './building-raffle.store';
import { withBuildingUsers } from './building-users.store';
import { AUTH_CONSTANTS } from '@core/constants';

interface BuildingDetailState {
  buildingId: string | null;
  building: BuildingModel | undefined;
}

const initialState: BuildingDetailState = {
  buildingId: localStorage.getItem(AUTH_CONSTANTS.BUILDING),
  building: undefined,
};

export const BuildingDetailStore = signalStore(
  { providedIn: 'root' },
  withDevtools('building-details'),
  withReset(),
  withState(initialState),
  withCallState(),
  withProps(() => ({
    _authStore: inject(AuthStore),
    _buildingService: inject(BuildingService),
  })),
  withComputed((store) => ({
    canEdit: computed(() => {
      const user = store._authStore.user();
      const building = store.building();
      if (!user || !building) return false;
      return (
        store._authStore.isRootUser() || user.buildingId === building.publicId
      );
    }),
  })),

  withMethods((store) => ({
    loadById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((id) =>
          store._buildingService.getById(id).pipe(
            tapResponse({
              next: (res) => {
                patchState(store, {
                  building: res.data,
                  buildingId: res.data.publicId,
                  callState: 'loaded',
                });
                localStorage.setItem(
                  AUTH_CONSTANTS.BUILDING,
                  res.data.publicId,
                );
              },
              error: (err: any) =>
                patchState(store, {
                  callState: {
                    error: err.error?.message || 'Failed to load building',
                  },
                }),
            }),
          ),
        ),
      ),
    ),
    clearContext: () =>
      patchState(store, { building: undefined, callState: 'loaded' }),
  })),
  withFeature(({ buildingId }) => withBuildingUsers(buildingId)),
  withFeature(({ buildingId }) => withBuildingRaffles(buildingId)),

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

        effect(() => {
          const buildingId = store.buildingId();
          const isLoggedIn = authStore.isAuthenticated();
          if (isLoggedIn) {
            if (buildingId && !store.next()) {
              store.loadNext();
            }
            if (buildingId && !store.building()) {
              store.loadById(buildingId);
            }
          }
        });
      },
    };
  }),
);
