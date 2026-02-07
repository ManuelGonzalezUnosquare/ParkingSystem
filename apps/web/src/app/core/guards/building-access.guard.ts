import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/stores';

export const accessBuildingGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const targetId = route.paramMap.get('id');
  const user = authStore.user();

  if (authStore.isRootUser()) return true;

  if (user?.building?.publicId === targetId) return true;

  return router.parseUrl('/app/dashboard');
};
