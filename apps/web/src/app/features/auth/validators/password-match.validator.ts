import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  const isMismatch = password.value !== confirmPassword.value;

  if (isMismatch) {
    // Marcamos el control individual como inválido para que la UI reaccione
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    // Si ya no hay mismatch, limpiamos el error específico pero mantenemos otros si existen
    const errors = confirmPassword.errors;
    if (errors) {
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
}
