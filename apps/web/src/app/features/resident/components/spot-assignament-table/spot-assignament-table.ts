import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-spot-assignament-table',
  imports: [CardModule, TableModule, ButtonModule],
  templateUrl: './spot-assignament-table.html',
  styleUrl: './spot-assignament-table.css',
})
export class SpotAssignamentTable {}
