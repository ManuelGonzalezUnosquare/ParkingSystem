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

  vehicles = computed(() => {
    return this.users().flatMap((user) => user.vehicles || []);
  });

  usersWithoutVehicle = computed(() => {
    return this.users().filter((f) => f.vehicles.length === 0);
  });
}
