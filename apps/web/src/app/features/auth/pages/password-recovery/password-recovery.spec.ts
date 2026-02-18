import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRecovery } from './password-recovery';
import { AuthStore } from '@core/stores';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { APP_CONFIG, APP_CONFIG_VALUE } from '@core/constants';

describe('PasswordRecovery', () => {
  let component: PasswordRecovery;
  let fixture: ComponentFixture<PasswordRecovery>;

  const mockStore = {
    loading: signal(false),
    callState: signal('init'),
    resetPasswordCode: signal(null),
    resetPasswordRequest: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecovery],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockStore },
        {
          provide: APP_CONFIG,
          useValue: APP_CONFIG_VALUE,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecovery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be invalid when email is empty', () => {
    component.form.controls.email.setValue('');
    expect(component.form.invalid).toBe(true);
  });

  it('should call store.resetPasswordRequest on submit if valid', async () => {
    component.form.controls.email.setValue('test@example.com');
    await component.doSubmit();

    expect(mockStore.resetPasswordRequest).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(component['isRequestSent']()).toBe(true);
  });

  it('should show success message when isRequestSent is true', async () => {
    (component as any).isRequestSent.set(true);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Check your Email');
  });
});
