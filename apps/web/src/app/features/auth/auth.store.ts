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
  RoleEnum,
  SessionModel,
  UserModel,
} from '@parking-system/libs';
import { AUTH_CONSTANTS } from '../../core/constants';
import { AuthService } from './auth.service';

interface AuthState {
  user: UserModel | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY), // Initial sync
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
  withComputed((store) => ({
    isLoading: computed(() => {
      return store.callState() === 'loading';
    }),
    isAuthenticated: computed(() => {
      return !!store.token();
    }),
    isRootUser: computed(() => {
      return store.user()?.role?.name === RoleEnum.ROOT;
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
                localStorage.setItem(
                  AUTH_CONSTANTS.TOKEN_STORAGE_KEY,
                  res.data.access_token,
                );
                patchState(store, {
                  token: res.data.access_token,
                  user: res.data.user,
                });
              },
              error: (err: any) => {
                const errorMessage = err.error?.message || 'Login failed';
                patchState(store, { callState: { error: errorMessage } });
              },
              complete: () => {
                console.log('ENTRO AL COMPLETE DEL LOGIN');
                patchState(store, { callState: 'loaded' });
              },
            }),
          ),
        ),
      ),
    ),
    initializeAuth: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap(() => {
          const token = store.token();

          if (!token) {
            patchState(store, { callState: 'loaded' });
            return of(null);
          }

          return store._authService.getCurrentUser().pipe(
            tapResponse({
              next: (res: ApiResponse<UserModel>) => {
                patchState(store, { user: res.data, callState: 'loaded' });
              },
              error: (err: any) => {
                const errorMessage = err.error?.message || 'Login failed';
                patchState(store, { callState: { error: errorMessage } });
                return of(null);
              },
            }),
          );
        }),
      ),
    ),
    logout: () => {
      localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
      store.resetState();
    },
  })),
  withHooks({
    onInit(store) {
      store.initializeAuth();
    },
  }),
);
