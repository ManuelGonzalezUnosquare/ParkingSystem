import { Component, computed, input } from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-utilization-card',
  imports: [CardModule, ProgressBarModule],
  templateUrl: './utilization-card.html',
  styleUrl: './utilization-card.css',
})
export class UtilizationCard {
  availableSpots = input.required<number>();
  users = input.required<UserModel[]>();

  assignedSlotsCount = computed(() => {
    return this.users().reduce((total, user) => {
      const userAssignedVehicles = user.vehicles.filter(
        (v) => v.slot !== null,
      ).length;
      return total + userAssignedVehicles;
    }, 0);
  });

  progressValue = computed(() => {
    const sCount = this.assignedSlotsCount();
    const aCount = this.availableSpots();
    return (sCount / aCount) * 100;
  });

  progressColor = computed(() => {
    const pValue = this.progressValue();
    if (pValue <= 45) return 'var(--p-green-500)';
    if (pValue <= 85) return 'var(--p-yellow-500)';
    if (pValue <= 99) return 'var(--p-orange-500)';
    return 'var(--p-red-500)';
  });
}
