import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-utilization-card',
  imports: [CardModule, ProgressBarModule],
  templateUrl: './utilization-card.html',
  styleUrl: './utilization-card.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilizationCard {
  availableSpots = input.required<number>();
  users = input.required<UserModel[]>();

  protected readonly assignedSlotsCount = computed(() => {
    return this.users().filter((u) => u.hasVehicle).length;
  });

  protected readonly progressValue = computed(() => {
    const total = this.availableSpots();
    if (total <= 0) return 0;

    const assigned = this.assignedSlotsCount();
    const percentage = (assigned / total) * 100;

    return Math.min(Math.trunc(percentage), 100);
  });

  protected readonly progressColor = computed(() => {
    const pValue = this.progressValue();
    if (pValue <= 45) return 'var(--p-emerald-500)';
    if (pValue <= 85) return 'var(--p-amber-500)';
    if (pValue <= 99) return 'var(--p-orange-500)';
    return 'var(--p-red-500)';
  });

  protected readonly utilizationStatus = computed(() => {
    const pValue = this.progressValue();
    if (pValue <= 45) return 'Optimal';
    if (pValue <= 85) return 'Moderate';
    if (pValue <= 99) return 'Critical';
    return 'Full';
  });
}
