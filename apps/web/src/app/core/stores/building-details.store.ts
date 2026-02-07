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
import { withBuildingUsersStore } from './building-users.store';

interface BuildingDetailState {
  building: BuildingModel | null;
}

interface BuildingDetailState {
  building: BuildingModel | null;
}

export const BuildingDetailStore = signalStore(
  { providedIn: 'root' },
  withDevtools('building-details'),
  withReset(),
  withState<BuildingDetailState>({
    building: null,
  }),
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
        store._authStore.isRootUser() ||
        user.building?.publicId === building.publicId
      );
    }),

    isAdminView: computed(() => !store._authStore.isRootUser()),
  })),

  withMethods((store) => ({
    loadById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((id) =>
          store._buildingService.getById(id).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  building: res.data,
                  callState: 'loaded',
                }),
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
      patchState(store, { building: null, callState: 'loaded' }),
  })),
  withBuildingUsersStore,
  withHooks({
    onInit(store) {
      effect(() => {
        const building = store.building();
        if (building) {
          store.loadAll({
            first: 0,
            rows: 10,
            buildingId: store.building()?.publicId,
          });
        }
      });
    },
  }),
);
