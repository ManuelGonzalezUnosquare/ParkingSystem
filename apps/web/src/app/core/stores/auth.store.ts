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
import { lastValueFrom, of, pipe, switchMap, tap } from 'rxjs';

import {
  ApiResponse,
  ILogin,
  IResetPasswordByCode,
  RoleEnum,
  SessionModel,
  UserModel,
} from '@parking-system/libs';
import { AuthService } from '../../features/auth/auth.service';
import { AUTH_CONSTANTS } from '../constants';

interface AuthState {
  user: UserModel | null;
  token: string | null;
  resetPasswordCode: string | undefined; //dev purpose only
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY), // Initial sync
  resetPasswordCode: undefined,
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
      return store.user()?.role === RoleEnum.ROOT;
    }),
    isAdminUser: computed(() => {
      return store.user()?.role === RoleEnum.ADMIN;
    }),
    isResident: computed(() => {
      return store.user()?.role === RoleEnum.USER;
    }),
  })),
  withMethods((store) => {
    const handleAuthSuccess = (session: SessionModel) => {
      localStorage.setItem(
        AUTH_CONSTANTS.TOKEN_STORAGE_KEY,
        session.access_token,
      );
      patchState(store, {
        token: session.access_token,
        user: session.user,
        callState: 'loaded',
      });
    };
    return {
      login: rxMethod<ILogin>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap((credentials) =>
            store._authService.login(credentials).pipe(
              tapResponse({
                next: (res: ApiResponse<SessionModel>) =>
                  handleAuthSuccess(res.data),
                error: (err: any) => {
                  patchState(store, { callState: 'loaded' });
                  const errorMessage = err.error?.message || 'Login failed';
                  patchState(store, { callState: { error: errorMessage } });
                },
              }),
            ),
          ),
        ),
      ),
      resetPasswordRequest: async (email: string): Promise<boolean> => {
        patchState(store, { callState: 'loading' });
        try {
          const response = await lastValueFrom(
            store._authService.requestResetPassword({ email }),
          );

          //if dev env
          patchState(store, {
            resetPasswordCode: response.data,
            callState: 'loaded',
          });

          return true;
        } catch (err: any) {
          patchState(store, {
            callState: {
              error: err.error?.message || 'Reset password request failed',
            },
          });
          return false;
        }
      },
      resetPasswordConfirm: async (
        dto: IResetPasswordByCode,
      ): Promise<boolean> => {
        patchState(store, { callState: 'loading' });
        try {
          const response = await lastValueFrom(
            store._authService.resetPasswordConfirm(dto),
          );
          patchState(store, { callState: 'loaded' });
          handleAuthSuccess(response.data);

          return true;
        } catch (err: any) {
          patchState(store, {
            callState: {
              error: err.error?.message || 'Reset password request failed',
            },
          });
          return false;
        }
      },
      changePassword: async (newPassword: string): Promise<boolean> => {
        patchState(store, { callState: 'loading' });
        try {
          const response = await lastValueFrom(
            store._authService.changePassword(newPassword),
          );
          patchState(store, { callState: 'loaded', user: response.data });
          return true;
        } catch (err: any) {
          patchState(store, {
            callState: {
              error: err.error?.message || 'Change password failed',
            },
          });
          return false;
        }
      },

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
        localStorage.clear();
        patchState(store, {
          token: null,
          user: null,
        });
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.initializeAuth();
    },
  }),
);
