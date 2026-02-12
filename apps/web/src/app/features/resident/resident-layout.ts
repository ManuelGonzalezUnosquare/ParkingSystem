import { Component, inject } from '@angular/core';
import { SessionService } from '@core/services';
import { Banner, SpotAssignamentTable, VehicleInfo } from './components';
import { ProfileStore } from '@core/stores';

@Component({
  selector: 'app-resident-layout',
  imports: [Banner, VehicleInfo, SpotAssignamentTable],
  templateUrl: './resident-layout.html',
  styleUrl: './resident-layout.css',
})
export class ResidentLayout {
  protected readonly sessionService = inject(SessionService);
  protected readonly profileStore = inject(ProfileStore);
}
