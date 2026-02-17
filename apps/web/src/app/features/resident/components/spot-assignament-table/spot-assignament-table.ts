import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RaffleResultModel } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-spot-assignament-table',
  imports: [CardModule, TableModule, ButtonModule, DatePipe],
  templateUrl: './spot-assignament-table.html',
  styleUrl: './spot-assignament-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SpotAssignamentTable {
  history = input.required<RaffleResultModel[]>();
}
