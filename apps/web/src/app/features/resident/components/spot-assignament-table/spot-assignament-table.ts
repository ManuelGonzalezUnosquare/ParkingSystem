import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  ApiPaginationMeta,
  RaffleResultModel,
  Search,
} from '@parking-system/libs';
import { RaffleUserResultTag, SlotAssignationTag } from '@shared/ui';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-spot-assignament-table',
  imports: [
    Card,
    TableModule,
    Button,
    DatePipe,
    RaffleUserResultTag,
    SlotAssignationTag,
  ],
  templateUrl: './spot-assignament-table.html',
  styleUrl: './spot-assignament-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SpotAssignamentTable {
  history = input.required<RaffleResultModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();

  filter = output<Search>();

  protected onSearch(event: TableLazyLoadEvent) {
    this.filter.emit({
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
    });
  }
}
