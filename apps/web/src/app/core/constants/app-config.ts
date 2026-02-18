import { InjectionToken } from '@angular/core';

export interface AppConfig {
  appName: string;
  supportEmail: string;
  defaultPagination: number;
}

export const APP_CONFIG_VALUE: AppConfig = {
  appName: 'Parking System Pro',
  supportEmail: 'support@parkingpro.com',
  defaultPagination: 10,
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
