import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RaffleModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-last-raffle-card',
  imports: [CardModule, DatePipe],
  templateUrl: './last-raffle-card.html',
  styleUrl: './last-raffle-card.css',
})
export class LastRaffleCard {
  raffle = input<RaffleModel>();
}
