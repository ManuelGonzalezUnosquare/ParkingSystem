import { FormControl } from "@angular/forms";

export type IRegister = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;

  buildingUnit: FormControl<string>;

  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};
