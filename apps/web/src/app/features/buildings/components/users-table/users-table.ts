import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  ApiPaginationMeta,
  SearchBuildingUsers,
  UserModel,
} from '@parking-system/libs';
import { RoleTag } from '@shared/ui';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-users-table',
  imports: [ButtonModule, TableModule, RoleTag, InputTextModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  // inputs
  readonly users = input.required<UserModel[]>();
  readonly pagination = input<ApiPaginationMeta>();
  readonly isLoading = input.required<boolean>();

  //outputs
  add = output();
  update = output<UserModel>();
  delete = output<UserModel>();
  filter = output<SearchBuildingUsers>();

  protected readonly existsUsers = computed(() => {
    return this.users().length > 0;
  });
  protected onLazyLoad(event: TableLazyLoadEvent) {
    this.filter.emit({
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
    });
  }
  protected addUser() {
    this.add.emit();
  }
  protected updateUser(user: UserModel) {
    this.update.emit(user);
  }
  protected deleteUser(user: UserModel) {
    this.delete.emit(user);
  }
}
