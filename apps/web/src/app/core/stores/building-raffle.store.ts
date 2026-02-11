import { withCallState, withReset } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { RaffleService } from '@features/buildings/services';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { BuildingModel, RaffleModel } from '@parking-system/libs';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';

const config = entityConfig({
  entity: type<RaffleModel>(),
  collection: 'raffles',
  selectId: (raffle: RaffleModel) => raffle.publicId,
});

type BuildingUsersState = {
  building: BuildingModel | undefined;
};

export const withBuildingRaffleStore = signalStoreFeature(
  withEntities(config),
  withReset(),
  withState<BuildingUsersState>({
    building: undefined,
  }),

  withCallState(),
  withProps(() => ({
    _raffleService: inject(RaffleService),
  })),
  withComputed((store) => ({
    liveRaffle: computed(() => {
      return store.rafflesEntities().find((f) => !f.executedAt);
    }),
  })),

  withMethods((store) => ({
    loadRaffles: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap(() =>
          store._raffleService.load().pipe(
            tapResponse({
              next: (response) =>
                patchState(store, setAllEntities(response.data, config), {
                  callState: 'loaded',
                }),
              error: (err: any) =>
                patchState(store, {
                  callState: {
                    error: err.error?.message || 'Load raffles failed',
                  },
                }),
            }),
          ),
        ),
      ),
    ),
    runRaffle: async (): Promise<boolean> => {
      patchState(store, { callState: 'loading' });
      try {
        const response = await lastValueFrom(
          store._raffleService.executeRaffle(),
        );
        patchState(store, { callState: 'loaded' });
        return true;
      } catch (err: any) {
        patchState(store, {
          callState: { error: err.error?.message || 'Run raffle failed' },
        });
        return false;
      }
    },
  })),
);
