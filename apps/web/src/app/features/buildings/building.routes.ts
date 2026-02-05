import { Routes } from '@angular/router';
import { Buildings } from './buildings';

export const BUILDING_ROUTES: Routes = [
  {
    path: '',
    component: Buildings,
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
];
