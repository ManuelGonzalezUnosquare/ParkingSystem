import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserRaffleResultEnum } from '@parking-system/libs';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-raffle-user-result-tag',
  imports: [Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './raffle-user-result-tag.html',
  styleUrl: './raffle-user-result-tag.css',
})
export class RaffleUserResultTag {
  status = input.required<string>();

  severity = computed(() => {
    const current = this.status();
    if (current === UserRaffleResultEnum.WINNER) return 'success';
    if (current === UserRaffleResultEnum.LOSER) return 'warn';

    return 'secondary';
  });
  label = computed(() => {
    const current = this.status();
    if (current === UserRaffleResultEnum.WINNER) return 'Winner';
    if (current === UserRaffleResultEnum.LOSER) return 'Waitlisted';

    return 'No vehicle';
  });
}
