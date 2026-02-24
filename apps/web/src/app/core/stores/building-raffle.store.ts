import { withCallState, withReset } from '@angular-architects/ngrx-toolkit';
import { computed, inject, Signal } from '@angular/core';
import { FeedbackService } from '@core/services';
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
  addEntity,
  entityConfig,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  ApiPaginationMeta,
  BuildingModel,
  RaffleModel,
} from '@parking-system/libs';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';

const config = entityConfig({
  entity: type<RaffleModel>(),
  collection: 'raffles',
  selectId: (raffle: RaffleModel) => raffle.publicId,
});

type BuildingUsersState = {
  rafflesPagination: ApiPaginationMeta | undefined;
};

export function withBuildingRaffles(
  building: Signal<BuildingModel | undefined>,
) {
  return signalStoreFeature(
    withEntities(config),
    withReset(),
    withState<BuildingUsersState>({
      rafflesPagination: undefined,
    }),
    withCallState(),
    withProps(() => ({
      _raffleService: inject(RaffleService),
      _feedbackService: inject(FeedbackService),
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
            store._raffleService.load(building()?.publicId || '').pipe(
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
          const { executed, upcoming } = response.data;
          patchState(
            store,
            updateEntity({ id: executed.publicId, changes: executed }, config),
            addEntity(upcoming, config),
            {
              callState: 'loaded',
            },
          );
          store._feedbackService.showSuccess(
            'Raffle Completed',
            'All parking spots have been assigned and history records updated.',
          );
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
}
