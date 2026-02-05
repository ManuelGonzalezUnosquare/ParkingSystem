import {
  withCallState,
  withDevtools,
  withReset,
} from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
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
import { of, pipe, switchMap, tap } from 'rxjs';

import { AuthService } from './auth.service';
import {
  UserModel,
  ILogin,
  ApiResponse,
  SessionModel,
} from '@parking-system/libs';

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
  })),
  withMethods((store) => ({
    login: rxMethod<ILogin>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((credentials) =>
          store._authService.login(credentials).pipe(
            tapResponse({
              next: (res: ApiResponse<SessionModel>) => {
                localStorage.setItem('token', res.data.access_token);
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
      localStorage.removeItem('token');
      patchState(store, { user: null, token: null });
    },
    initializeAuth: rxMethod<void>(
      pipe(
        switchMap(() => {
          const token = localStorage.getItem('token');
          if (!token) return of(null);

          return store._authService.getCurrentUser().pipe(
            tapResponse({
              next: (res: ApiResponse<UserModel>) => {
                patchState(store, { user: res.data });
              },
              error: (err: any) => {
                localStorage.removeItem('token');
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
