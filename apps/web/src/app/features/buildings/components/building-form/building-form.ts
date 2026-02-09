import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { IBuildingForm } from './iBuilding-form';
import { BuildingModel, ICreateBuilding } from '@parking-system/libs';
import { BuildingsStore } from '@core/stores';
import { FormValidationError, FormFeedback } from '@shared/ui/feedback';

@Component({
  selector: 'app-building-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    FormValidationError,
    FormFeedback,
  ],
  templateUrl: './building-form.html',
  styleUrl: './building-form.css',
})
export class BuildingForm implements OnInit {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  store = inject(BuildingsStore);

  building?: BuildingModel;

  form = new FormGroup<IBuildingForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    totalSlots: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  ngOnInit(): void {
    this.building = this.config.data.building;
    if (this.building) {
      this.form.patchValue({
        name: this.building.name,
        address: this.building.address,
        totalSlots: this.building.totalSlots,
      });
    }
  }

  async doSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: ICreateBuilding = this.form.getRawValue();
    let requestResult = false;
    if (this.building) {
      requestResult = await this.store.update(this.building.publicId, request);
    } else {
      requestResult = await this.store.create(request);
    }
    if (requestResult) {
      this.ref.close(true);
    }
  }
  doCancel() {
    this.ref.close();
  }
}
