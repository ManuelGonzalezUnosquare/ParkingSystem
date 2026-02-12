import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RaffleModel, UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-banner',
  imports: [CardModule, DatePipe],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  user = input.required<UserModel>();
  nextRaffle = input<RaffleModel>();
}
