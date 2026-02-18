import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { SessionService } from '@core/services';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('Navbar Component', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  const mockSessionService = {
    logout: vi.fn(),
    isResident: signal(false),
    sideBarItems: signal([{ label: 'My Spots', routerLink: '/spots' }]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should only show notification icon when not a resident', () => {
    mockSessionService.isResident.set(false);
    fixture.detectChanges();

    const items = component['items']();
    expect(items.length).toBe(1);
    expect(items[0].icon).toBe('pi pi-bell');
  });

  it('should include sidebar items when user is a resident', () => {
    mockSessionService.isResident.set(true);
    fixture.detectChanges();

    const items = component['items']();
    // 1 de sidebar + 1 de notificaciones
    expect(items.length).toBe(2);
    expect(items.some((i) => i.label === 'My Spots')).toBe(true);
  });

  it('should call logout on button click', () => {
    const logoutBtn = fixture.nativeElement.querySelector(
      'p-button[severity="danger"]',
    );
    logoutBtn.click();
    expect(mockSessionService.logout).toHaveBeenCalled();
  });
});

// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Navbar } from './navbar';
//
// describe('Navbar', () => {
//   let component: Navbar;
//   let fixture: ComponentFixture<Navbar>;
//
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Navbar]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(Navbar);
//     component = fixture.componentInstance;
//     await fixture.whenStable();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
