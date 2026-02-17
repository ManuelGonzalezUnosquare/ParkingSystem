import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRecovery } from './password-recovery';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@core/stores';
import { vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';

describe('PasswordRecovery Component', () => {
  let component: PasswordRecovery;
  let fixture: ComponentFixture<PasswordRecovery>;

  const mockStore = {
    resetPasswordRequest: vi.fn(),
    resetPasswordCode: vi.fn(() => null),
    loading: vi.fn(() => false),
    callState: vi.fn(() => ({ res: 'IDLE' })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [PasswordRecovery, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecovery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render initial state correctly', () => {
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Reset Your Password');
    expect(component['isRequestSent']()).toBe(false);
  });

  it('should not call store if email is invalid', async () => {
    component['form'].controls.email.setValue('not-an-email');
    await component['doSubmit']();
    expect(mockStore.resetPasswordRequest).not.toHaveBeenCalled();
  });

  it('should call store and show success state on success', async () => {
    component['form'].controls.email.setValue('test@example.com');
    mockStore.resetPasswordRequest.mockResolvedValue(true);

    await component['doSubmit']();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockStore.resetPasswordRequest).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(component['isRequestSent']()).toBe(true);

    const successTitle = fixture.nativeElement.querySelector('h2');
    expect(successTitle.textContent).toContain('Email Sent!');
  });
});
