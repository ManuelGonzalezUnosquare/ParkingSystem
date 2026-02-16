import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  const isMismatch = password.value !== confirmPassword.value;

  if (isMismatch) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    const errors = confirmPassword.errors;
    if (errors) {
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
}
