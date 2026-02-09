import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { BuildingDetailStore } from '@core/stores';
import { UserForm } from '@features/buildings/components';
import { SearchBuildingUsers, UserModel } from '@parking-system/libs';
import { RoleTag, UserStatusTag } from '@shared/ui';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-building-details',
  imports: [
    ButtonModule,
    TableModule,
    RoleTag,
    CardModule,
    InputTextModule,
    UserStatusTag,
  ],
  templateUrl: './building-details.html',
  styleUrl: './building-details.css',
  standalone: true,
  providers: [DialogService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingDetails implements OnInit {
  readonly store = inject(BuildingDetailStore);
  readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogConfig = {
    width: '50vw',
    modal: true,
    closable: true,
    breakpoints: {
      '960px': '75vw',
      '640px': '90vw',
    },
  };
  id = input.required<string>();

  ngOnInit(): void {
    this.store.loadById(this.id());
  }

  addUser() {
    this.openBuildingDialog('Create User');
  }
  update(user: UserModel) {
    this.openBuildingDialog('Update User', user);
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    if (!this.store.building()) return;
    const searchParams: SearchBuildingUsers = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
      buildingId: this.store.building()?.publicId,
    };

    this.store.loadAll(searchParams);
  }

  private openBuildingDialog(header: string, user?: UserModel) {
    this.dialogService.open(UserForm, {
      ...this.dialogConfig,
      header,
      data: { user },
    });
  }
}
