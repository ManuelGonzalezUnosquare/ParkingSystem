import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLayout } from './auth-layout';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('AuthLayout', () => {
  let component: AuthLayout;
  let fixture: ComponentFixture<AuthLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should render the router-outlet to host auth content', () => {
    const outlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(outlet).toBeTruthy();
  });

  it('should show the copyright footer with correct year', () => {
    const footer = fixture.nativeElement.querySelector('footer');
    expect(footer.textContent).toContain('2026');
    expect(footer.textContent).toContain('Parking Lot Allocation System');
  });

  it('should have accessible legal links navigation', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Legal links');

    const links = nav.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent.trim()).toBe('Privacy Policy');
  });
});

// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { AuthLayout } from './auth-layout';
//
// describe('AuthLayout', () => {
//   let component: AuthLayout;
//   let fixture: ComponentFixture<AuthLayout>;
//
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [AuthLayout]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(AuthLayout);
//     component = fixture.componentInstance;
//     await fixture.whenStable();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
