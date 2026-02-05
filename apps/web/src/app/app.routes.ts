import { Route } from '@angular/router';
import { MainLayout } from './features/layout/main-layout';
import { authGuard, roleGuard } from './features/auth/guards';
import { RoleEnum } from '@parking-system/libs';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'app',
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleEnum.ROOT, RoleEnum.ADMIN] },
    component: MainLayout,
    children: [],
  },
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: '**', // Comodín para 404
    redirectTo: 'auth/login',
  },
];
