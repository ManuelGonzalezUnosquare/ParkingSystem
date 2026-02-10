import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '@core/stores';
import { Navbar, ResetPasswordModal, Sidebar } from './components';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  providers: [DialogService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  readonly authStore = inject(AuthStore);
  readonly dialogService = inject(DialogService);

  protected requiresPasswordChange = computed(() => {
    return this.authStore.user()?.requirePasswordChange ?? false;
  });

  constructor() {
    effect(() => {
      const cRequirePasswordChange = this.requiresPasswordChange();
      if (cRequirePasswordChange) {
        this.dialogService.open(ResetPasswordModal, {
          dismissableMask: false,
          closeOnEscape: false,
          closable: false,
          modal: true,
          pt: {
            root: 'border-0 bg-transparent',
            header: 'hidden',
            content: 'border-0 bg-transparent p-0',
            footer: 'border-0 bg-transparent p-0',
          },
        });
      }
    });
  }
}
