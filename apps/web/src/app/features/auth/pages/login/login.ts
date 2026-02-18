import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/stores';
import { ILogin } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ILoginForm } from './login-form';
import { FormFeedback, FormValidationError } from '@shared/ui/feedback';
import { APP_CONFIG } from '@core/constants';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
    FormValidationError,
    FormFeedback,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Login {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);
  protected readonly config = inject(APP_CONFIG);

  protected readonly form = new FormGroup<ILoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(7)],
    }),
  });

  constructor() {
    effect(() => {
      if (this.store.token()) {
        this.router.navigateByUrl('/app');
      }
    });
  }

  doSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const request: ILogin = this.form.getRawValue();
    this.store.login(request);
  }
}
