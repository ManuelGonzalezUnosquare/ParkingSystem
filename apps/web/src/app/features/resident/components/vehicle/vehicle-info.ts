import { Component, input } from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-vehicle-info',
  imports: [CardModule, ButtonModule, TagModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo {
  user = input.required<UserModel>();
}
