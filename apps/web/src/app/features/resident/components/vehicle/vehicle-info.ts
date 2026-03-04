import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { SlotAssignationTag } from '@shared/ui';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-vehicle-info',
  imports: [CardModule, ButtonModule, SlotAssignationTag],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleInfo {
  user = input.required<UserModel>();
}
