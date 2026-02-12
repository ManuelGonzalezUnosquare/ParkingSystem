import { Component, computed, input } from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-vehicles-card',
  imports: [CardModule],
  templateUrl: './vehicles-card.html',
  styleUrl: './vehicles-card.css',
})
export class VehiclesCard {
  users = input.required<UserModel[]>();

  usersWithVehicle = computed(() => {
    return this.users().filter((f) => f.hasVehicle).length;
  });

  usersWithoutVehicle = computed(() => {
    return this.users().filter((f) => !f.hasVehicle).length;
  });
}
