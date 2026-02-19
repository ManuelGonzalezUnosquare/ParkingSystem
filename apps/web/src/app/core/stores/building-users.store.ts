import { withCallState, withReset } from '@angular-architects/ngrx-toolkit';
import { computed, inject, Signal } from '@angular/core';
import { UsersService } from '@features/buildings/services';
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
  addEntity,
  entityConfig,
  removeEntity,
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
  usersPagination: ApiPaginationMeta | undefined;
};

export function withBuildingUsers(building: Signal<BuildingModel | undefined>) {
  return signalStoreFeature(
    withEntities(config),
    withReset(),
    withState<BuildingUsersState>({
      usersPagination: undefined,
    }),
    withProps(() => ({
      _usersService: inject(UsersService),
    })),
    withCallState(),
    withComputed((store) => ({
      isLoading: computed(() => {
        return store.callState() === 'loading';
      }),

      residentCount: computed(() => {
        return store.usersEntities().filter((f) => f.role === RoleEnum.USER)
          .length;
      }),
    })),
    withMethods((store) => ({
      loadUsers: rxMethod<SearchBuildingUsers>(
        pipe(
          tap(() => patchState(store, { callState: 'loading' })),
          switchMap((dto) =>
            store._usersService.getAll(dto).pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, setAllEntities(response.data, config), {
                    callState: 'loaded',
                    usersPagination: response.meta,
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
              buildingId: building()?.publicId,
            }),
          );
          patchState(store, addEntity(response.data, config), {
            callState: 'loaded',
            usersPagination: {
              ...store.usersPagination()!,
              total: (store.usersPagination()?.total || 0) + 1,
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
              buildingId: building()?.publicId,
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
      delete: async (id: string): Promise<boolean> => {
        patchState(store, { callState: 'loading' });
        try {
          await lastValueFrom(store._usersService.delete(id));
          patchState(store, removeEntity(id, config), { callState: 'loaded' });
          return true;
        } catch (err: any) {
          patchState(store, {
            callState: { error: err.error?.message || 'Delete failed' },
          });
          return false;
        }
      },
    })),
  );
}
