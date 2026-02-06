import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';

const ERROR_MESSAGES: Record<string, (label: string, args: any) => string> = {
  required: (label) => `${label} is required.`,
  email: () => `Please enter a valid email address.`,
  minlength: (label, args) =>
    `${label} must be at least ${args.requiredLength} characters.`,
  maxlength: (label, args) =>
    `${label} cannot exceed ${args.requiredLength} characters.`,
  min: (label, args) => `${label} must be at least ${args.min}.`,
  pattern: (label) => `${label} format is invalid.`,
};

@Component({
  selector: 'app-form-validation-error',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldShowErrors()) {
      <div class="flex flex-column gap-1 mt-1">
        @for (error of errorMessages(); track $index) {
          <small class="p-error block animate-fade-in text-xs">
            {{ error }}
          </small>
        }
      </div>
    }
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class FormValidationError {
  readonly errors = input.required<ValidationErrors | null>();
  readonly touched = input.required<boolean>();
  readonly label = input<string>('Field');

  protected readonly shouldShowErrors = computed(
    () => !!this.errors() && this.touched(),
  );

  protected readonly errorMessages = computed(() => {
    const errs = this.errors();
    if (!errs) return [];

    const labelText = this.label();

    return Object.entries(errs).map(([key, value]) => {
      const config = ERROR_MESSAGES[key];
      return config
        ? config(labelText, value)
        : `${labelText}: Invalid field (${key})`;
    });
  });
}
