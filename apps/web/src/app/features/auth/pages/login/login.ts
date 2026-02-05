import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../../auth.store';
import { JsonPipe } from '@angular/common';
import { ILoginForm } from './login-form';
import { ILogin } from '@parking-system/libs';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
    JsonPipe,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly router = inject(Router);
  readonly store = inject(AuthStore);
  readonly form = new FormGroup<ILoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
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
