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
        loadChildren: () =>
          import('./features/buildings/building.routes').then(
            (m) => m.BUILDING_ROUTES,
          ),
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
