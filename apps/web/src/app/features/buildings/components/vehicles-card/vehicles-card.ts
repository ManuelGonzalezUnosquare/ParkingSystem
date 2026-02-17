import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-vehicles-card',
  imports: [CardModule],
  templateUrl: './vehicles-card.html',
  styleUrl: './vehicles-card.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesCard {
  users = input.required<UserModel[]>();

  private readonly vehicleStats = computed(() => {
    return this.users().reduce(
      (acc, user) => {
        if (user.hasVehicle) {
          acc.withVehicle++;
        } else {
          acc.withoutVehicle++;
        }
        return acc;
      },
      { withVehicle: 0, withoutVehicle: 0 },
    );
  });

  protected readonly usersWithVehicle = computed(
    () => this.vehicleStats().withVehicle,
  );
  protected readonly usersWithoutVehicle = computed(
    () => this.vehicleStats().withoutVehicle,
  );
}
