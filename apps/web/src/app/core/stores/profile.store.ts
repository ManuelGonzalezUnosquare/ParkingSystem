import {
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { effect, inject } from '@angular/core';
import { RaffleService } from '@features/buildings/services';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  ApiResponse,
  RaffleModel,
  RaffleResultModel,
} from '@parking-system/libs';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthStore } from './auth.store';

interface ProfileState {
  historyRaffle: RaffleResultModel[];
  nextRaffle: RaffleModel | undefined;
}
const initialState: ProfileState = {
  historyRaffle: [],
  nextRaffle: undefined,
};

export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withDevtools('profile'),
  withReset(),
  withState(initialState),
  withCallState(),
  withProps(() => ({
    _raffleService: inject(RaffleService),
    _authStore: inject(AuthStore),
  })),
  withMethods((store) => ({
    loadHistory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap(() =>
          store._raffleService
            .loadHistory(store._authStore.user()!.buildingId || '')
            .pipe(
              tapResponse({
                next: (res: ApiResponse<RaffleResultModel[]>) =>
                  patchState(store, {
                    historyRaffle: res.data,
                    callState: 'loaded',
                  }),
                error: (err: any) => {
                  const errorMessage =
                    err.error?.message || 'Load history failed';
                  patchState(store, { callState: { error: errorMessage } });
                },
              }),
            ),
        ),
      ),
    ),
    loadNext: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap(() =>
          store._raffleService
            .loadNext(store._authStore.user()!.buildingId || '')
            .pipe(
              tapResponse({
                next: (res: ApiResponse<RaffleModel>) =>
                  patchState(store, {
                    nextRaffle: res.data,
                    callState: 'loaded',
                  }),
                error: (err: any) => {
                  const errorMessage = err.error?.message || 'Load next failed';
                  patchState(store, { callState: { error: errorMessage } });
                },
              }),
            ),
        ),
      ),
    ),
  })),
  withHooks((store) => {
    const authStore = inject(AuthStore);
    return {
      onInit: (): void => {
        effect(() => {
          const isLoggedIn = authStore.isAuthenticated();
          if (!isLoggedIn) {
            store.resetState();
          } else {
            store.loadNext();
            store.loadHistory();
          }
        });
      },
    };
  }),
);
