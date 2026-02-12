import { computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores';
import { filter, map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as Array<string>;
  const authStatus = computed(() => ({
    isLoading: authStore.isLoading(),
    user: authStore.user(),
    token: authStore.token(),
  }));

  return toObservable(authStatus).pipe(
    filter(({ isLoading, token }) => !isLoading || !token),
    take(1),
    map(({ user, token }) => {
      const uRole = user?.role;
      if (token && expectedRoles.includes(uRole ?? '')) {
        return true;
      }

      router.navigate(['/unauthorized']);
      return false;
    }),
  );
};
