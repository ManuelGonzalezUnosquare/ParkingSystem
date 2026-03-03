import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ApiPaginationMeta,
  RaffleHistoryModel,
  RaffleStatusEnum,
  Search,
} from '@parking-system/libs';
import { Button } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-building-raffle-history-table',
  imports: [
    TableModule,
    DatePipe,
    ToggleSwitch,
    FormsModule,
    Button,
    Tag,
    RouterLink,
  ],
  templateUrl: './building-raffle-history-table.html',
  styleUrl: './building-raffle-history-table.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingRaffleHistoryTable {
  raffles = input.required<RaffleHistoryModel[]>();
  isLoading = input.required<boolean>();
  pagination = input<ApiPaginationMeta>();
  filter = output<Search>();
  raffleStatus = RaffleStatusEnum;
  router = inject(Router);

  //TODO: remove results from raffle and
  //request them to the service on demand

  protected onLazyLoad(event: TableLazyLoadEvent) {
    const f: Search = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
    };
    this.filter.emit(f);
  }
}
