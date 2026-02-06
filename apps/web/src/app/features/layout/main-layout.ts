import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionService } from '../../core/services';
import { AuthStore } from '../../core/stores/auth.store';
import { Navbar, Sidebar } from './components';
import { BuildingsStore } from '../../core/stores/buildings.store';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  authStore = inject(AuthStore);
  sessionService = inject(SessionService);
  buildingStore = inject(BuildingsStore);
}
