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
        path: 'password-recovery',
        loadComponent: () =>
          import('./pages/password-recovery/password-recovery').then(
            (m) => m.PasswordRecovery,
          ),
      },
      {
        path: 'password-recovery-confirm',
        loadComponent: () =>
          import(
            './pages/password-recovery-confirm/password-recovery-confirm'
          ).then((m) => m.PasswordRecoveryConfirm),
      },
    ],
  },
];
