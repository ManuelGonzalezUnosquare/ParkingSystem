import { Component, computed, input } from '@angular/core';
import { VehicleModel } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-vehicle-info',
  imports: [CardModule, ButtonModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo {
  vehicle = input<VehicleModel>();
  slot = computed(() => this.vehicle()?.slot);
}
