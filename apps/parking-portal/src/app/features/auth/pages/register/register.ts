import { Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { IRegister } from "./register-form";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-register",
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
    TagModule,
  ],
  templateUrl: "./register.html",
  styleUrl: "./register.css",
})
export class Register {
  readonly form = new FormGroup<IRegister>({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    lastName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    buildingUnit: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    confirmPassword: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
}
