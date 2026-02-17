import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthStore } from '@core/stores';
import { passwordMatchValidator } from '@features/auth/validators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ResetPasswordModal {
  private ref = inject(DynamicDialogRef);
  protected readonly store = inject(AuthStore);
  readonly form = new FormGroup(
    {
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      confirmPassword: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [passwordMatchValidator] },
  );

  async doSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const { password } = this.form.getRawValue();

    const success = await this.store.changePassword(password);
    if (success) {
      this.ref.close();
    }
  }
}
