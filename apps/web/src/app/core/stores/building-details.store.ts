import {
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
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
  building: BuildingModel | undefined;
}

const initialState: BuildingDetailState = {
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
      patchState(store, { building: undefined, callState: 'loaded' }),
  })),
  withBuildingUsersStore,
);
