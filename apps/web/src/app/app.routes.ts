import { Route } from '@angular/router';
import { accessBuildingGuard, authGuard, roleGuard } from '@core/guards';
import { MainLayout } from './features/layout/main-layout';
import { RoleEnum } from '@parking-system/libs';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'buildings',
        canActivate: [roleGuard],
        data: { roles: [RoleEnum.ROOT] },
        loadComponent: () =>
          import('./features/buildings/pages/buildings/buildings').then(
            (m) => m.Buildings,
          ),
      },
      {
        path: 'buildings/:id/details',
        canActivate: [roleGuard, accessBuildingGuard],
        data: { roles: [RoleEnum.ROOT, RoleEnum.ADMIN] },
        loadComponent: () =>
          import(
            './features/buildings/pages/building-details/building-details'
          ).then((m) => m.BuildingDetails),
      },
      {
        path: 'buildings/:id/history',
        canActivate: [roleGuard, accessBuildingGuard],
        data: { roles: [RoleEnum.ROOT, RoleEnum.ADMIN] },
        loadComponent: () =>
          import(
            './features/buildings/pages/allocation-history/allocation-history'
          ).then((m) => m.AllocationHistory),
      },
      {
        path: 'history/:id/result',
        canActivate: [roleGuard],
        data: { roles: [RoleEnum.ROOT, RoleEnum.ADMIN] },
        loadComponent: () =>
          import(
            './features/buildings/pages/raffle-result-page/raffle-result-page'
          ).then((m) => m.RaffleResultPage),
      },
    ],
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
