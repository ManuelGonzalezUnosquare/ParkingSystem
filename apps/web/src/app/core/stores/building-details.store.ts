import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { BuildingModel } from '@parking-system/libs';
import { AuthStore } from './auth.store';
import { BuildingService } from '../../features/buildings/building.service';

/**
 * Initial State
 */
interface BuildingDetailState {
  building: BuildingModel | null;
  callState: 'idle' | 'loading' | 'loaded' | { error: string };
}

export const BuildingDetailStore = signalStore(
  { providedIn: 'root' },
  withState<BuildingDetailState>({
    building: null,
    callState: 'idle',
  }),

  // 1. Computed capabilities (The "Security" Layer)
  withComputed((store) => {
    const authStore = inject(AuthStore);

    return {
      // Permission signals
      canEdit: computed(() => {
        const user = authStore.user();
        const building = store.building();
        if (!user || !building) return false;
        return (
          authStore.isRootUser() ||
          user.building?.publicId === building.publicId
        );
      }),

      isAdminView: computed(() => !authStore.isRootUser()),
    };
  }),

  // 2. Core Methods (The "Data" Layer)
  withMethods((store) => {
    const buildingService = inject(BuildingService);

    return {
      loadById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap((id) =>
            buildingService.getById(id).pipe(
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
        patchState(store, { building: null, callState: 'idle' }),
    };
  }),
);
