import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayout } from './main-layout';
import { AuthStore } from '@core/stores';
import { DialogService } from 'primeng/dynamicdialog';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  const userSignal = signal<any>(null);
  const isRootSignal = signal(true);
  const isAdminSignal = signal(false);

  const mockAuthStore = {
    user: userSignal,
    isRootUser: isRootSignal,
    isAdminUser: isAdminSignal,
  };

  const mockDialogService = {
    open: vi.fn().mockReturnValue({ onClose: { subscribe: vi.fn() } }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    })
      .overrideComponent(MainLayout, {
        set: {
          providers: [{ provide: DialogService, useValue: mockDialogService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;

    // Resetear estados por defecto
    userSignal.set({ requirePasswordChange: false });
    isRootSignal.set(true);

    fixture.detectChanges();
  });

  it('should open ResetPasswordModal when user needs change', async () => {
    userSignal.set({ requirePasswordChange: true });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('should show sidebar only for admins/root', async () => {
    isRootSignal.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('aside')).toBeTruthy();

    isRootSignal.set(false);
    isAdminSignal.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('aside')).toBeFalsy();
  });
});
