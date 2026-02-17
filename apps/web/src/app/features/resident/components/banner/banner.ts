import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RaffleModel, UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-banner',
  imports: [CardModule, DatePipe],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Banner {
  user = input.required<UserModel>();
  nextRaffle = input<RaffleModel>();
}
