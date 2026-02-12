import { Component, input } from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-vehicle-info',
  imports: [CardModule, ButtonModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo {
  user = input.required<UserModel>();
}
