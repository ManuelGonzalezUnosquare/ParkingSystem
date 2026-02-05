import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BuildingModel } from '@parking-system/libs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { BuildingStore } from './building.store';
import { BuildingForm } from './components';

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
  readonly buildingStore = inject(BuildingStore);
  readonly dialogService = inject(DialogService);
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
          // this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Building removed' });
        }
      },
    });
  }

  private openBuildingDialog(header: string, building?: BuildingModel) {
    this.dialogService.open(BuildingForm, {
      ...this.dialogConfig,
      header,
      data: { building },
    });
  }
}
