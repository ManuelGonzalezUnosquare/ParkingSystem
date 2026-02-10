import { Component, input } from '@angular/core';
import { UserModel } from '@parking-system/libs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-banner',
  imports: [CardModule],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  user = input.required<UserModel>();
}
