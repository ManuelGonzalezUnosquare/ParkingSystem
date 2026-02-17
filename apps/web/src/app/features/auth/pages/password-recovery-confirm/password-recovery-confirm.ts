import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/stores';
import { AuthService } from '@features/auth/auth.service';
import { passwordMatchValidator } from '@features/auth/validators';
import { FormFeedback, FormValidationError } from '@shared/ui/feedback';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { lastValueFrom } from 'rxjs';
import { IPasswordRecoveryConfirmation } from './password-recovery-form';
import { APP_CONFIG } from '@core/constants';

@Component({
  selector: 'app-password-recovery-confirm',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FormValidationError,
    FormFeedback,
    ButtonModule,
    RouterLink,
  ],
  templateUrl: './password-recovery-confirm.html',
  styleUrl: './password-recovery-confirm.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordRecoveryConfirm {
  protected readonly store = inject(AuthStore);
  private readonly service = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly config = inject(APP_CONFIG);

  protected readonly step = signal<1 | 2>(1);
  private readonly email = signal<string | undefined>(undefined);

  codeForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  readonly passwordForm = new FormGroup<IPasswordRecoveryConfirmation>(
    {
      code: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [passwordMatchValidator], updateOn: 'blur' },
  );

  constructor() {
    effect(() => {
      const cCode = this.store.resetPasswordCode();
      if (cCode) {
        this.codeForm.controls.code.setValue(cCode);
      }
    });
  }

  async doSubmitCode() {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;

    const { code } = this.codeForm.getRawValue();

    try {
      const response = await lastValueFrom(
        this.service.validateResetCode(code),
      );
      if (response.data) {
        this.passwordForm.patchValue({ email: response.data, code });
        this.email.set(response.data);
        this.step.set(2);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async doSubmitPassword() {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    const { email, password, code } = this.passwordForm.getRawValue();
    const success = await this.store.resetPasswordConfirm({
      newPassword: password,
      email,
      code,
    });

    if (success) {
      this.router.navigate(['/auth/login']);
    }
  }
}
