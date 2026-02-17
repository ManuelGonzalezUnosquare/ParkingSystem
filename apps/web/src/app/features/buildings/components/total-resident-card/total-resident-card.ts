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

  private readonly stats = computed(() => {
    return this.users().reduce(
      (acc, user) => {
        if (user.role === RoleEnum.ADMIN) acc.admins++;
        if (user.role === RoleEnum.USER) acc.residents++;
        return acc;
      },
      { admins: 0, residents: 0 },
    );
  });

  protected readonly adminCount = computed(() => this.stats().admins);
  protected readonly residentCount = computed(() => this.stats().residents);
}
