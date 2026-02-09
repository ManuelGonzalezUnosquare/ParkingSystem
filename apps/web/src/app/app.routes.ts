import { Route } from '@angular/router';
import { authGuard } from '@core/guards';
import { MainLayout } from './features/layout/main-layout';

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
        loadComponent: () =>
          import('./features/buildings/pages/buildings/buildings').then(
            (m) => m.Buildings,
          ),
      },
      {
        path: 'buildings/:id/details',
        loadComponent: () =>
          import(
            './features/buildings/pages/building-details/building-details'
          ).then((m) => m.BuildingDetails),
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
