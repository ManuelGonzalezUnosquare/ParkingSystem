import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRecoveryConfirm } from './password-recovery-confirm';

describe('PasswordRecoveryConfirm', () => {
  let component: PasswordRecoveryConfirm;
  let fixture: ComponentFixture<PasswordRecoveryConfirm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryConfirm],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryConfirm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
