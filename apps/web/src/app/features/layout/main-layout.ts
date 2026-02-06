import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar, Sidebar } from './components';
import { SessionService } from '@core/services';
import { AuthStore, BuildingsStore } from '@core/stores';

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
