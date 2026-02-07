import { withCallState } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { UsersService } from '@features/buildings/services/users.service';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  ApiPaginationMeta,
  BuildingModel,
  SearchBuildingUsers,
  UserModel,
} from '@parking-system/libs';
import { pipe, switchMap, tap } from 'rxjs';

const config = entityConfig({
  entity: type<UserModel>(),
  collection: 'users',
  selectId: (user: UserModel) => user.publicId,
});

type BuildingUsersState = {
  building: BuildingModel | undefined;
  pagination: ApiPaginationMeta | undefined;
};

export const withBuildingUsersStore = signalStoreFeature(
  withEntities(config),
  withState<BuildingUsersState>({
    building: undefined,
    pagination: undefined,
  }),
  withCallState(),
  withProps(() => ({
    _usersService: inject(UsersService),
  })),
  withComputed((store) => ({
    isLoading: computed(() => {
      return store.callState() === 'loading';
    }),
  })),
  withMethods((store) => ({
    loadAll: rxMethod<SearchBuildingUsers>(
      pipe(
        tap(() => patchState(store, { callState: 'loading' })),
        switchMap((dto) =>
          store._usersService
            .getAll({ ...dto, buildingId: store.building()?.publicId })
            .pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, setAllEntities(response.data, config), {
                    callState: 'loaded',
                    pagination: response.meta,
                  }),
                error: (err: any) =>
                  patchState(store, {
                    callState: {
                      error: err.error?.message || 'Load buildings failed',
                    },
                  }),
              }),
            ),
        ),
      ),
    ),
  })),
);
