import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordModal } from './reset-password-modal';

describe('ResetPasswordModal', () => {
  let component: ResetPasswordModal;
  let fixture: ComponentFixture<ResetPasswordModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
