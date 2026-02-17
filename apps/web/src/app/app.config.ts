import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from '../preset';
import { appRoutes } from './app.routes';
import {
  apiInterceptor,
  authInterceptor,
  errorInterceptor,
} from './core/interceptors';
import { APP_CONFIG, APP_CONFIG_VALUE } from '@core/constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiInterceptor, authInterceptor, errorInterceptor]),
    ),
    MessageService,
    providePrimeNG({
      inputVariant: 'filled',
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    {
      provide: APP_CONFIG,
      useValue: APP_CONFIG_VALUE,
    },
  ],
};
