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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
