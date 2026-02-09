import { withCallState } from '@angular-architects/ngrx-toolkit';
import { computed, effect, inject } from '@angular/core';
import { UsersService } from '@features/buildings/services/users.service';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStoreFeature,
  type,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  ApiPaginationMeta,
  BuildingModel,
  ICreateUser,
  RoleEnum,
  SearchBuildingUsers,
  UserModel,
} from '@parking-system/libs';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';

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
    adminCount: computed(() => {
      return store
        .usersEntities()
        .filter((f) => f.role?.name === RoleEnum.ADMIN);
    }),
    residentCount: computed(() => {
      return store
        .usersEntities()
        .filter((f) => f.role?.name === RoleEnum.USER);
    }),
    vehicleCount: computed(() => {
      return store
        .usersEntities()
        .filter((f) => f.vehicles.length > 0)
        .map((f) => f.vehicles).length;
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
    create: async (dto: ICreateUser): Promise<boolean> => {
      patchState(store, { callState: 'loading' });
      try {
        const response = await lastValueFrom(
          store._usersService.create({
            ...dto,
            buildingId: store.building()?.publicId,
          }),
        );
        patchState(store, addEntity(response.data, config), {
          callState: 'loaded',
          pagination: {
            ...store.pagination()!,
            total: (store.pagination()?.total || 0) + 1,
          },
        });

        return true;
      } catch (err: any) {
        patchState(store, {
          callState: { error: err.error?.message || 'Create user failed' },
        });
        return false;
      }
    },

    update: async (id: string, dto: ICreateUser): Promise<boolean> => {
      patchState(store, { callState: 'loading' });
      try {
        const response = await lastValueFrom(
          store._usersService.update(id, {
            ...dto,
            buildingId: store.building()?.publicId,
          }),
        );
        patchState(
          store,
          updateEntity({ id, changes: response.data }, config),
          {
            callState: 'loaded',
          },
        );
        return true;
      } catch (err: any) {
        patchState(store, {
          callState: { error: err.error?.message || 'Update user failed' },
        });
        return false;
      }
    },
  })),

  withHooks({
    onInit(store) {
      effect(() => {
        const building = store.building();
        if (building) {
          store.loadAll({
            first: 0,
            rows: 10,
            buildingId: store.building()?.publicId,
          });
        }
      });
    },
  }),
);
