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
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe, switchMap, tap } from 'rxjs';

import {
  ApiResponse,
  ILogin,
  SessionModel,
  UserModel,
} from '@parking-system/libs';
import { SessionService } from '../../core/services';
import { AuthService } from './auth.service';

// 1. Core Auth State
interface AuthState {
  user: UserModel | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'), // Initial sync
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('auth'),
  withReset(),
  withCallState(),
  withProps(() => ({
    _authService: inject(AuthService),
    _sessionService: inject(SessionService),
  })),

  withComputed((store) => ({
    isLoading: computed(() => {
      return store.callState() === 'loading';
    }),
  })),

  withMethods((store) => ({
    login: rxMethod<ILogin>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((credentials) =>
          store._authService.login(credentials).pipe(
            tapResponse({
              next: (res: ApiResponse<SessionModel>) => {
                store._sessionService.loadSession(res.data.access_token);
                patchState(store, {
                  token: res.data.access_token,
                  user: res.data.user,
                });
              },
              error: (err: any) => {
                const errorMessage = err.error?.message || 'Login failed';
                patchState(store, { callState: { error: errorMessage } });
              },
            }),
          ),
        ),
      ),
    ),
    logout: () => {
      store._sessionService.logout();
      patchState(store, { user: null, token: null });
    },
    initializeAuth: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap(() => {
          let token = store.token() || store._sessionService.token();
          if (!token) {
            store._sessionService.loadSession();
            token = store._sessionService.token();
          }
          if (!token) {
            patchState(store, { callState: 'loaded' });
            return of(null);
          }

          return store._authService.getCurrentUser().pipe(
            tapResponse({
              next: (res: ApiResponse<UserModel>) => {
                patchState(store, { user: res.data });
                patchState(store, { callState: 'loaded' });
              },
              error: (err: any) => {
                store._sessionService.logout();
                const errorMessage = err.error?.message || 'Login failed';
                patchState(store, { callState: { error: errorMessage } });
                return of(null);
              },
            }),
          );
        }),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.initializeAuth();
    },
  }),
);
