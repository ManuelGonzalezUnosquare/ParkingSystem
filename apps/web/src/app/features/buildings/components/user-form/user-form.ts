import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SessionService } from '@core/services';
import { BuildingDetailStore } from '@core/stores';
import { ICreateUser, RoleEnum, UserModel } from '@parking-system/libs';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { IUserForm } from './iUser-form';
import { requireVehicleDetails } from './vehicle-details.validator';
import { FormFeedback, FormValidationError } from '@shared/ui/feedback';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    DividerModule,
    FormValidationError,
    FormFeedback,
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  readonly sessionService = inject(SessionService);
  user?: UserModel;
  store = inject(BuildingDetailStore);
  roles = Object.values(RoleEnum).filter((r) => r !== RoleEnum.ROOT);
  form = new FormGroup<IUserForm>(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      role: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      licensePlate: new FormControl('', {
        nonNullable: true,
      }),
      description: new FormControl('', {
        nonNullable: true,
      }),
    },
    {
      validators: [requireVehicleDetails],
      updateOn: 'blur',
    },
  );
  //add role
  ngOnInit(): void {
    this.form.patchValue({ role: RoleEnum.USER });
    this.user = this.config.data.user;
    if (this.user) {
      this.form.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        licensePlate: this.user.hasVehicle ? this.user.vehiclePlate : '',
        description: this.user.hasVehicle ? this.user.vehicleDescription : '',
      });
    }
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: ICreateUser = this.form.getRawValue();
    let requestResult = false;
    if (!this.user) {
      requestResult = await this.store.create(request);
    } else {
      requestResult = await this.store.update(this.user.publicId, request);
    }

    if (requestResult) {
      this.ref.close(true);
    }
  }
  doCancel() {
    this.ref.close();
  }
}
