import { FormControl } from '@angular/forms';

export type IUserForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<string>;
  //vehicle
  licensePlate: FormControl<string>;
  description: FormControl<string>;
};
