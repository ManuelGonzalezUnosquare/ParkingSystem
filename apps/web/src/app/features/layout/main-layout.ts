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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

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
  private readonly dialogService = inject(DialogService);
  private dialogRef: DynamicDialogRef<ResetPasswordModal> | null;

  protected readonly requiresPasswordChange = computed(() => {
    return this.authStore.user()?.requirePasswordChange ?? false;
  });

  constructor() {
    effect(() => {
      const needsChange = this.requiresPasswordChange();

      if (needsChange && !this.dialogRef) {
        this.openSecurityModal();
      } else if (!needsChange && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    });
  }

  private openSecurityModal(): void {
    this.dialogRef = this.dialogService.open(ResetPasswordModal, {
      dismissableMask: false,
      closeOnEscape: false,
      closable: false,
      modal: true,
      pt: {
        root: { class: 'border-none shadow-none bg-transparent' },
        mask: { class: 'backdrop-blur-md bg-slate-900/60' },
        content: { class: 'p-0 bg-transparent' },
        header: { class: 'hidden' },
      },
    });
  }
}
