import { Component, inject } from '@angular/core';
import { BuildingDetailStore } from '@core/stores';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-allocation-history',
  imports: [TableModule, CardModule, ButtonModule],
  templateUrl: './allocation-history.html',
  styleUrl: './allocation-history.css',
})
export class AllocationHistory {
  protected readonly store = inject(BuildingDetailStore);
}
