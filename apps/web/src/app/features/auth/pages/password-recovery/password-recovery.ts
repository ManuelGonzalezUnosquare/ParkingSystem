import { Component, effect, inject, signal } from '@angular/core';
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
})
export class PasswordRecovery {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  isRequestSent = signal<boolean>(false);
  readonly form = new FormGroup<IPasswordRecovery>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  constructor() {
    effect(() => {
      const cCode = this.store.resetPasswordCode();
      if (!cCode) return;

      this.router.navigateByUrl(`/auth/password-recovery-confirm`);
    });
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { email } = this.form.getRawValue();

    const response = await this.store.resetPasswordRequest(email);
    if (response) {
      this.isRequestSent.set(response);
    }
  }
}
