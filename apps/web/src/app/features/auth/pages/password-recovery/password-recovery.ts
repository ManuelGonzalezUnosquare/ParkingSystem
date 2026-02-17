import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IPasswordRecovery } from './password-recover-form-';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/stores';
import { FormValidationError, FormFeedback } from '@shared/ui/feedback';

@Component({
  selector: 'app-password-recovery',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
    FormValidationError,
    FormFeedback,
  ],
  templateUrl: './password-recovery.html',
  styleUrl: './password-recovery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class PasswordRecovery {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly isRequestSent = signal<boolean>(false);

  readonly form = new FormGroup<IPasswordRecovery>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  constructor() {
    effect(() => {
      if (this.store.resetPasswordCode()) {
        untracked(() =>
          this.router.navigate(['/auth/password-recovery-confirm']),
        );
      }
    });
  }

  async doSubmit() {
    if (this.store.loading()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { email } = this.form.getRawValue();
    const success = await this.store.resetPasswordRequest(email);

    if (success) {
      this.isRequestSent.set(true);
    }
  }
}
