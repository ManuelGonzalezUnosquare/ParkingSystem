import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { filter, take, map } from 'rxjs';

export const accessBuildingGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const targetId = route.paramMap.get('id');

  return toObservable(authStore.isLoading).pipe(
    filter((isLoading) => !isLoading),
    take(1),
    map(() => {
      const user = authStore.user();

      if (authStore.isRootUser()) return true;

      if (user?.buildingId === targetId || user?.buildingId === targetId) {
        return true;
      }

      return router.createUrlTree(['/app/dashboard']);
    }),
  );
};
