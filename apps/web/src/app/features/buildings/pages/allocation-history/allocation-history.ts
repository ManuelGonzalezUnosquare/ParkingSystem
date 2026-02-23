import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuildingDetailStore } from '@core/stores';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-allocation-history',
  imports: [
    TableModule,
    CardModule,
    ButtonModule,
    DatePipe,
    ToggleSwitchModule,
    FormsModule,
  ],
  templateUrl: './allocation-history.html',
  styleUrl: './allocation-history.css',
})
export class AllocationHistory {
  protected readonly store = inject(BuildingDetailStore);
}
