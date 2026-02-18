import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRecoveryConfirm } from './password-recovery-confirm';
import { AuthStore } from '@core/stores';
import { AuthService } from '@features/auth/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { APP_CONFIG, APP_CONFIG_VALUE } from '@core/constants';

describe('PasswordRecoveryConfirm', () => {
  let component: PasswordRecoveryConfirm;
  let fixture: ComponentFixture<PasswordRecoveryConfirm>;

  const mockAuthStore = {
    loading: signal(false),
    callState: signal('init'),
    resetPasswordCode: signal(null),
    resetPasswordConfirm: vi.fn().mockResolvedValue(true),
  };

  const mockAuthService = {
    validateResetCode: vi.fn().mockReturnValue(of({ data: 'user@test.com' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryConfirm],
      providers: [
        provideRouter([]), // SOLUCIÓN AL NG0201
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: APP_CONFIG,
          useValue: APP_CONFIG_VALUE,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryConfirm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at step 1', () => {
    expect(component['step']()).toBe(1);
  });

  it('should move to step 2 when code is valid', async () => {
    component.codeForm.controls.code.setValue('12345678');
    await component.doSubmitCode();

    expect(mockAuthService.validateResetCode).toHaveBeenCalledWith('12345678');
    expect(component['step']()).toBe(2);
    expect(component['passwordForm'].value.email).toBe('user@test.com');
  });

  it('should call resetPasswordConfirm on step 2 submit', async () => {
    component['step'].set(2);
    component.passwordForm.patchValue({
      password: 'new-password-123',
      confirmPassword: 'new-password-123',
      email: 'user@test.com',
      code: '12345678',
    });

    await component.doSubmitPassword();

    expect(mockAuthStore.resetPasswordConfirm).toHaveBeenCalled();
  });
});
