import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuildingDetailStore } from '@core/stores';
import { BuildingRaffleHistoryTable } from '@features/buildings/components';
import { LastRaffleCard } from '@features/buildings/components/last-raffle-card/last-raffle-card';
import { PageHeader } from '@shared/ui';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-allocation-history',
  imports: [
    TableModule,
    Card,
    FormsModule,
    BuildingRaffleHistoryTable,
    PageHeader,
    LastRaffleCard,
  ],
  templateUrl: './allocation-history.html',
  styleUrl: './allocation-history.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationHistory {
  protected readonly store = inject(BuildingDetailStore);
}
