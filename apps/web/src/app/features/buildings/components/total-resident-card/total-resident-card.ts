import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RoleEnum, UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-total-resident-card',
  imports: [CardModule],
  templateUrl: './total-resident-card.html',
  styleUrl: './total-resident-card.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalResidentCard {
  users = input.required<UserModel[]>();

  adminCount = computed(() => {
    return this.users().filter((f) => f.role?.name === RoleEnum.ADMIN).length;
  });
  residentCount = computed(() => {
    return this.users().filter((f) => f.role?.name === RoleEnum.USER).length;
  });
}
