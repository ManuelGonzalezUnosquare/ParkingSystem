import { FormControl } from '@angular/forms';

export type IBuildingForm = {
  name: FormControl<string>;
  address: FormControl<string>;
  totalSlots: FormControl<number>;
};
