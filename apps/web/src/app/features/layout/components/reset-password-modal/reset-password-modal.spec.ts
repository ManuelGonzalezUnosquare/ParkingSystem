import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordModal } from './reset-password-modal';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthStore } from '@core/stores';
import { vi } from 'vitest';

describe('ResetPasswordModal', () => {
  let component: ResetPasswordModal;
  let fixture: ComponentFixture<ResetPasswordModal>;

  const mockRef = { close: vi.fn() };
  const mockStore = {
    changePassword: vi.fn(),
    loading: vi.fn(() => false),
    callState: vi.fn(() => ({ res: 'IDLE' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordModal],
      providers: [
        { provide: DynamicDialogRef, useValue: mockRef },
        { provide: AuthStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be invalid if passwords do not match', () => {
    component.form.patchValue({
      password: 'password123',
      confirmPassword: 'password456',
    });

    expect(component.form.errors?.['mismatch']).toBeDefined();
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid if passwords match and meet minimum length', () => {
    component.form.patchValue({
      password: 'securePassword',
      confirmPassword: 'securePassword',
    });

    expect(component.form.valid).toBe(true);
  });

  it('should call store and close on success', async () => {
    component.form.patchValue({
      password: 'validPassword',
      confirmPassword: 'validPassword',
    });
    mockStore.changePassword.mockResolvedValue(true);

    await component['doSubmit']();

    expect(mockStore.changePassword).toHaveBeenCalledWith('validPassword');
    expect(mockRef.close).toHaveBeenCalled();
  });
});
