import { withCallState, withReset } from '@angular-architects/ngrx-toolkit';
import { inject, Signal } from '@angular/core';
import { FeedbackService } from '@core/services';
import { RaffleService } from '@features/buildings/services';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  ApiPaginationMeta,
  RaffleHistoryModel,
  RaffleModel,
  RaffleResultModel,
  Search,
  SearchRaffleResults,
} from '@parking-system/libs';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';

type RaffleResultsView = {
  data: RaffleResultModel[];
  pagination: ApiPaginationMeta | undefined;
  filters: Search;
};

type BuildingUsersState = {
  next: RaffleModel | undefined;
  rafflesHistory: RaffleHistoryModel[];
  rafflesPagination: ApiPaginationMeta | undefined;
  //
  selectedRaffleId: string | null;
  selectedRaffle: RaffleModel | undefined;
  resultsView: RaffleResultsView | undefined;
};

export function withBuildingRaffles(buildingId: Signal<string | null>) {
  return signalStoreFeature(
    withReset(),
    withState<BuildingUsersState>({
      next: undefined,
      rafflesHistory: [],
      rafflesPagination: undefined,
      selectedRaffleId: null,
      resultsView: undefined,
      selectedRaffle: undefined,
    }),
    withCallState(),
    withProps(() => ({
      _raffleService: inject(RaffleService),
      _feedbackService: inject(FeedbackService),
    })),
    withMethods((store) => ({
      loadNext: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap(() =>
            store._raffleService.loadNext(buildingId()!).pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, {
                    callState: 'loaded',
                    next: response.data,
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
      loadSelected: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap((id) =>
            store._raffleService.loadById(id).pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, {
                    callState: 'loaded',
                    selectedRaffle: response.data,
                  }),

                error: (err: any) =>
                  patchState(store, {
                    callState: {
                      error:
                        err.error?.message || 'Load selected raffle failed',
                    },
                  }),
              }),
            ),
          ),
        ),
      ),
      loadHistory: rxMethod<Search>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap((dto) =>
            store._raffleService.loadHistory(buildingId()!, dto).pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, {
                    callState: 'loaded',
                    rafflesHistory: response.data,
                    rafflesPagination: response.meta,
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
      loadResults: rxMethod<SearchRaffleResults>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap((dto) =>
            store._raffleService.loadResults(dto).pipe(
              tapResponse({
                next: (response) => {
                  patchState(store, {
                    selectedRaffleId: dto.raffleId,
                    resultsView: {
                      data: response.data,
                      pagination: response.meta,
                      filters: dto,
                    },
                    callState: 'loaded',
                  });
                },
                error: (err: any) =>
                  patchState(store, {
                    callState: {
                      error: err.error?.message || 'Load results failed',
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
            store._raffleService.executeRaffle(buildingId()!),
          );
          const { executed, upcoming } = response.data;
          patchState(store, { callState: 'loaded', next: upcoming });

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
