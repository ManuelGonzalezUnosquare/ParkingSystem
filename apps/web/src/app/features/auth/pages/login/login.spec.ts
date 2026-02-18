import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@core/stores';
import { Button } from 'primeng/button';
import { vi } from 'vitest';
import { Login } from './login';
import { mock } from 'node:test';
import { APP_CONFIG, APP_CONFIG_VALUE } from '@core/constants';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  const mockStore = {
    login: vi.fn(),
    token: vi.fn(() => null),
    isLoading: vi.fn(() => false),
    callState: vi.fn(() => 'init'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockStore },
        {
          provide: APP_CONFIG,
          useValue: APP_CONFIG_VALUE,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component['form'].controls.email;
    emailControl.setValue('invalid-email');
    expect(emailControl.invalid).toBe(true);
    expect(emailControl.errors?.['email']).toBeTruthy();
  });

  it('should call store.login when form is valid', () => {
    component['form'].patchValue({
      email: 'test@test.com',
      password: 'password123',
    });

    component['doSubmit']();

    expect(mockStore.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('should not call login if form is invalid', () => {
    component['form'].patchValue({ email: '', password: '' });
    component['doSubmit']();
    expect(mockStore.login).not.toHaveBeenCalled();
  });
});
