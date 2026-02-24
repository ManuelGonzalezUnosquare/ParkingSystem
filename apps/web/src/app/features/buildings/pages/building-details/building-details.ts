import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SessionService } from '@core/services';
import { BuildingDetailStore } from '@core/stores';
import {
  RunRaffle,
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
import { map, take } from 'rxjs';

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
export class BuildingDetails implements OnInit, OnDestroy {
  readonly store = inject(BuildingDetailStore);
  readonly dialogService = inject(DialogService);
  private readonly sessionService = inject(SessionService);
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
  searchParams: SearchBuildingUsers = {
    first: 0,
    rows: 10,
    sortField: 'createdAt',
    sortOrder: -1,
    globalFilter: undefined,
    buildingId: undefined,
  };

  id = input.required<string>();
  protected readonly existsUsers = computed(() => {
    return (this.store.usersPagination()?.total || 0) !== 0;
  });

  ngOnInit(): void {
    if (!this.store.building()) {
      this.store.loadById(this.id());
    }
  }
  ngOnDestroy(): void {
    if (!this.sessionService.isAdmin()) {
      this.store.resetState();
    }
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
    this.searchParams = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
      buildingId: this.id(),
    };

    this.store.loadUsers(this.searchParams);
  }

  private openBuildingDialog(header: string, user?: UserModel) {
    this.dialogService.open(UserForm, {
      ...this.dialogConfig,
      header,
      data: { user },
    });
  }
  runRaffle() {
    const ref = this.dialogService.open(RunRaffle, {
      ...this.dialogConfig,
      closable: false,
      showHeader: false,
    });
    ref?.onClose
      .pipe(
        take(1),
        map((res) => {
          if (res) {
            this.store.loadUsers({
              ...this.searchParams,
              first: 0,
              sortField: 'createdAt',
              sortOrder: -1,
              buildingId: this.id(),
            });
          }
        }),
      )
      .subscribe();
  }
}
