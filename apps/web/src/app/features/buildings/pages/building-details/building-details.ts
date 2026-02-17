import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { BuildingDetailStore } from '@core/stores';
import {
  TotalResidentCard,
  UserForm,
  UtilizationCard,
  VehiclesCard,
} from '@features/buildings/components';
import { LastRaffleCard } from '@features/buildings/components/last-raffle-card/last-raffle-card';
import { SearchBuildingUsers, UserModel } from '@parking-system/libs';
import { RoleTag } from '@shared/ui';
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
    //cards
    TotalResidentCard,
    VehiclesCard,
    LastRaffleCard,
    UtilizationCard,
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

  async delete(user: UserModel) {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${user.fullName} from this building?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      // accept: () => this.store.deleteUser(user.publicId),
    });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const searchParams: SearchBuildingUsers = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? '',
      buildingId: this.id(),
    };

    this.store.loadUsers(searchParams);
  }

  private openBuildingDialog(header: string, user?: UserModel) {
    this.dialogService.open(UserForm, {
      ...this.dialogConfig,
      header,
      data: { user },
    });
  }
  async raffle() {
    this.store.runRaffle();
  }
}
