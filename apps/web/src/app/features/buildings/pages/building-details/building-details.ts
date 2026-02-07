import { Component, inject, input, OnInit } from '@angular/core';
import { BuildingDetailStore } from '@core/stores';
import { SearchBuildingUsers } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-building-details',
  imports: [ButtonModule, TableModule, TagModule],
  templateUrl: './building-details.html',
  styleUrl: './building-details.css',
})
export class BuildingDetails implements OnInit {
  id = input.required<string>();
  readonly store = inject(BuildingDetailStore);

  ngOnInit(): void {
    this.store.loadById(this.id());
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const searchParams: SearchBuildingUsers = {
      first: event.first ?? 0,
      rows: event.rows ?? 10,
      sortField: (event.sortField as string) ?? 'createdAt',
      sortOrder: event.sortOrder ?? -1,
      globalFilter: (event.globalFilter as string) ?? undefined,
    };

    this.store.loadAll(searchParams);
  }
}
