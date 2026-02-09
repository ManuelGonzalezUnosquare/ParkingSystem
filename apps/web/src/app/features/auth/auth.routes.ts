import { Routes } from '@angular/router';
import { AuthLayout } from './auth-layout';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register').then((m) => m.Register),
      },
      {
        path: 'password-recovery',
        loadComponent: () =>
          import('./pages/password-recovery/password-recovery').then(
            (m) => m.PasswordRecovery,
          ),
      },
    ],
  },
];
