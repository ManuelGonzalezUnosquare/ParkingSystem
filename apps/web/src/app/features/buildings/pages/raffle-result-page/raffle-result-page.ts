import { DatePipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuildingDetailStore } from '@core/stores';
import {
  RaffleModel,
  SearchRaffleResults,
  UserRaffleResultEnum,
} from '@parking-system/libs';
import { PageHeader } from '@shared/ui';
import { Card } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-raffle-result-page',
  imports: [
    Card,
    TableModule,
    PageHeader,
    DatePipe,
    Tag,
    InputTextModule,
    SelectModule,
    FormsModule,
    JsonPipe,
  ],
  templateUrl: './raffle-result-page.html',
  styleUrl: './raffle-result-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RaffleResultPage {
  protected readonly store = inject(BuildingDetailStore);
  protected readonly userResultStatus = UserRaffleResultEnum;
  protected readonly userRaffleResultOptions = [
    { label: 'Winners', value: UserRaffleResultEnum.WINNER },
    { label: 'Losers', value: UserRaffleResultEnum.LOSER },
    {
      label: 'Excluded (No Vehicle)',
      value: UserRaffleResultEnum.EXCLUDED_NO_VEHICLE,
    },
  ];
  readonly id = input.required<string>();
  filters = signal<SearchRaffleResults>({
    first: 0,
    rows: 10,
    sortField: 'createdAt',
    sortOrder: -1,
    globalFilter: undefined,
    raffleId: '',
  });
  building = computed(() => this.store.building());
  raffle = computed(() => this.store.selectedRaffle());

  constructor() {
    effect(() => {
      const cFilters = this.filters();
      const cId = this.id();

      if (!cId) return;

      this.store.loadResults({ ...cFilters, raffleId: cId });
    });

    effect(() => {
      const cId = this.id();
      const cRaffle = this.store.selectedRaffle();
      if (!cId) return;

      if (cRaffle) {
        return;
      }

      this.store.loadSelected(cId);
    });
  }

  protected search(event: TableLazyLoadEvent) {
    this.filters.set({
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
      raffleId: '',
    });
  }

  searchByStatus(event: SelectChangeEvent) {
    this.filters.update((f) => ({
      ...f,
      status: event.value ? event.value : undefined,
    }));
  }
}
