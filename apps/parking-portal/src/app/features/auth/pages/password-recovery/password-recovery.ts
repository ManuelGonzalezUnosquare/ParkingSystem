import { Component, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { IPasswordRecovery } from "./password-recover-form-";
import { ButtonModule } from "primeng/button";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-password-recovery",
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, RouterLink],
  templateUrl: "./password-recovery.html",
  styleUrl: "./password-recovery.css",
})
export class PasswordRecovery {
  isRequestSent = signal<boolean>(false);
  readonly form = new FormGroup<IPasswordRecovery>({
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
}
