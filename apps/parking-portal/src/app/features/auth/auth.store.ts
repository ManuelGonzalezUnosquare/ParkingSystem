import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";
import { withCallStatus } from "@ngrx-traits/signals";

import { LoginDto } from "@org/shared-models";
import { User } from "../../core/models";
import { AuthService } from "./auth.service";

// 1. Core Auth State
interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"), // Initial sync
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withCallStatus(),

  withMethods(
    (store, authService = inject(AuthService), router = inject(Router)) => ({
      /**
       * Handles the login flow using ngrx-traits and rxMethod
       */
      login: rxMethod<LoginDto>(
        pipe(
          // Sets callStatus to 'loading'
          tap(() => patchState(store)),

          switchMap((credentials) =>
            authService.login(credentials).pipe(
              tap((response) => {
                // Persist and Update State
                localStorage.setItem("token", response.access_token);

                patchState(store, {
                  token: response.access_token,
                });

                // Navigate based on business role logic
                // const targetRoute = response.user.role.toLowerCase();
                // router.navigate([`/${targetRoute}`]);
              }),
              catchError((error) => {
                // Sets callStatus to { error: ... }
                console.log("error", error);
                patchState(store);
                return of(null);
              })
            )
          )
        )
      ),

      /**
       * Clears session and redirects to login
       */
      logout: () => {
        localStorage.removeItem("token");
        patchState(store, { user: null, token: null });
        router.navigate(["/auth/login"]);
      },
    })
  )
);
