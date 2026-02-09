import { FormControl } from '@angular/forms';

export type IPasswordRecoveryConfirmation = {
  code: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};
