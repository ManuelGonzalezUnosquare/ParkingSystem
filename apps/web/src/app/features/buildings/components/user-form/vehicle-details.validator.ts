import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export function requireVehicleDetails(
  control: AbstractControl,
): ValidationErrors | null {
  const group = control as FormGroup;
  const license = group.get('licensePlate')?.value;
  const description = group.get('description')?.value;

  const licenseProvided = !!license;
  const descProvided = !!description;

  if (licenseProvided && !descProvided) {
    group.get('description')?.setErrors({ requiredIfLicenseProvided: true });
    return { vehicleDetailsIncomplete: true };
  }

  if (!licenseProvided && descProvided) {
    group
      .get('licensePlate')
      ?.setErrors({ requiredIfDescriptionProvided: true });
    return { vehicleDetailsIncomplete: true };
  }

  group.get('licensePlate')?.setErrors(null);
  group.get('description')?.setErrors(null);
  return null;
}
