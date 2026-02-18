import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormValidationError } from './form-validation-error';

describe('FormValidationError', () => {
  let component: FormValidationError;
  let fixture: ComponentFixture<FormValidationError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormValidationError],
    }).compileComponents();

    fixture = TestBed.createComponent(FormValidationError);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not show errors if the field is not touched', () => {
    fixture.componentRef.setInput('errors', { required: true });
    fixture.componentRef.setInput('touched', false);

    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('div');
    expect(container).toBeNull();
  });

  it('should not show errors if there are no validation errors', () => {
    fixture.componentRef.setInput('errors', null);
    fixture.componentRef.setInput('touched', true);

    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('div');
    expect(container).toBeNull();
  });

  it('should show error messages when touched and has errors', () => {
    const fieldLabel = 'Email';
    fixture.componentRef.setInput('label', fieldLabel);
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('errors', { required: true });

    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('small');
    expect(errorElement).toBeTruthy();
    // Aquí validamos que el mensaje contenga el label
    expect(errorElement.textContent).toContain(fieldLabel);
  });

  it('should show multiple error messages if multiple validations fail', () => {
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('errors', {
      required: true,
      minlength: { requiredLength: 5, actualLength: 2 },
    });

    fixture.detectChanges();

    const errorElements = fixture.nativeElement.querySelectorAll('small');
    expect(errorElements.length).toBe(2);
  });

  it('should use default message if error key is not in ERROR_MESSAGES', () => {
    const unknownKey = 'randomError';
    fixture.componentRef.setInput('label', 'Password');
    fixture.componentRef.setInput('touched', true);
    fixture.componentRef.setInput('errors', { [unknownKey]: true });

    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('small');
    expect(errorElement.textContent).toContain(`Invalid field (${unknownKey})`);
  });
});
