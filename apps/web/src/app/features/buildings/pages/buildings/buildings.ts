import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BuildingsStore } from '@core/stores';
import { BuildingForm } from '@features/buildings/components';
import { BuildingModel, Search } from '@parking-system/libs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-buildings',
  imports: [TableModule, ButtonModule, InputTextModule, ConfirmDialogModule],
  templateUrl: './buildings.html',
  styleUrl: './buildings.css',
  standalone: true,
  providers: [DialogService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Buildings {
  readonly buildingStore = inject(BuildingsStore);
  readonly dialogService = inject(DialogService);
  readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogConfig = {
    width: '30vw',
    modal: true,
    closable: true,
    breakpoints: {
      '960px': '75vw',
      '640px': '90vw',
    },
  };

  add() {
    this.openBuildingDialog('Create Building');
  }
  update(building: BuildingModel) {
    this.openBuildingDialog('Update Building', building);
  }
  remove(building: BuildingModel) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${building.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptButtonProps: {
        disabled: this.buildingStore.isLoading(),
      },
      closeButtonProps: {
        disabled: this.buildingStore.isLoading(),
      },
      accept: async () => {
        const success = await this.buildingStore.delete(building.publicId);
        if (success) {
          console.log('success');
        }
      },
    });
  }
  viewDetails(building: BuildingModel) {
    this.router.navigate([`/app/buildings`, building.publicId, 'details']);
  }
  onLazyLoad(event: TableLazyLoadEvent) {
    const searchParams: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
    };

    this.buildingStore.loadAll(searchParams);
  }

  private openBuildingDialog(header: string, building?: BuildingModel) {
    this.dialogService.open(BuildingForm, {
      ...this.dialogConfig,
      header,
      data: { building },
    });
  }
}
