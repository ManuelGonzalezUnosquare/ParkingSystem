import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BuildingDetailStore } from '@core/stores';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-run-raffle',
  imports: [ButtonModule, DatePipe],
  templateUrl: './run-raffle.html',
  styleUrl: './run-raffle.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunRaffle {
  private ref = inject(DynamicDialogRef);
  protected readonly store = inject(BuildingDetailStore);

  doCancel(): void {
    this.ref.close();
  }

  async doSubmit() {
    const success = await this.store.runRaffle();
    if (success) {
      this.ref.close(true);
    }
  }
}
