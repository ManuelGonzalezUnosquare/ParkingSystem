import { FormControl } from "@angular/forms";

export type ILogin = {
  email: FormControl<string>;
  password: FormControl<string>;
};
