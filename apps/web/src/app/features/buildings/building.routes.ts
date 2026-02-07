import { Routes } from '@angular/router';
import { BuildingLayout } from './building-layout';
import { accessBuildingGuard, roleGuard } from '@core/guards';
import { RoleEnum } from '@parking-system/libs';

export const BUILDING_ROUTES: Routes = [
  {
    path: '',
    component: BuildingLayout,
    children: [
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: [RoleEnum.ROOT] },
        loadComponent: () =>
          import('./pages/buildings/buildings').then((c) => c.Buildings),
      },
      {
        path: ':id/details',
        canActivate: [roleGuard, accessBuildingGuard],
        data: { roles: [RoleEnum.ROOT, RoleEnum.ADMIN] },
        loadComponent: () =>
          import('./pages/building-details/building-details').then(
            (c) => c.BuildingDetails,
          ),
      },
    ],
  },
];
