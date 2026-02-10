import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthStore } from '@core/stores';
import { FormFeedback, FormValidationError } from '@shared/ui/feedback';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-reset-password-modal',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    FormFeedback,
    FormValidationError,
  ],
  templateUrl: './reset-password-modal.html',
  styleUrl: './reset-password-modal.css',
})
export class ResetPasswordModal {
  private ref = inject(DynamicDialogRef);
  protected readonly store = inject(AuthStore);
  protected form = new FormGroup({
    password: new FormControl<string>(''),
    confirmPassword: new FormControl<string>(''),
  });

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { password } = this.form.getRawValue();

    const response = await this.store.changePassword(password!);
    if (response) {
      this.ref.close();
    }
  }
}
