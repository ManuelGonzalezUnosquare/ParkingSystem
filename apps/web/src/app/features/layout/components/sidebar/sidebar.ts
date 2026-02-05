import { Component, inject, signal } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SessionService } from '../../../../core/services/session.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  sessionService = inject(SessionService);
  footerMenu = signal<MenuItem[]>([
    {
      label: 'Logout',
      labelClass: 'text-red-400',
      icon: 'pi pi-sign-out',
      iconClass: 'text-red-400 font-bold',
      command: (): void => this.sessionService.logout(),
    },
  ]);
}
