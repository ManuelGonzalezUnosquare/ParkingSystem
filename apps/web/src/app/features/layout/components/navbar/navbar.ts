import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '@core/services';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    ToolbarModule,
    InputTextModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  protected readonly sessionService = inject(SessionService);

  protected readonly items = computed<MenuItem[]>(() => {
    const staticItems: MenuItem[] = [
      {
        icon: 'pi pi-bell',
        routerLink: '/app/notifications',
      },
    ];

    if (this.sessionService.isResident()) {
      return [...this.sessionService.sideBarItems(), ...staticItems];
    }

    return staticItems;
  });
}
