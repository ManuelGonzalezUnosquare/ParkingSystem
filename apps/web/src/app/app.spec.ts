import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importamos el componente (standalone) y el ToastModule
      imports: [App, ToastModule],
      providers: [
        // Proveemos rutas vacías para que RouterOutlet no falle
        provideRouter([]),
        // MessageService es OBLIGATORIO para que p-toast funcione
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'web'`, () => {
    // Accedemos a la propiedad protected mediante casting o bypass si es necesario,
    // pero lo ideal es probar el comportamiento.
    expect((component as any).title).toEqual('web');
  });

  it('should render the p-toast component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Verificamos que el selector de PrimeNG esté presente en el DOM
    expect(compiled.querySelector('p-toast')).not.toBeNull();
  });

  it('should render the router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Verificamos que el componente de enrutado esté listo
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});

// import { TestBed } from '@angular/core/testing';
// import { App } from './app';
//
// describe('App', () => {
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({}).compileComponents();
//   });
//
//   it('should render title', async () => {
//     const fixture = TestBed.createComponent(App);
//     await fixture.whenStable();
//     const compiled = fixture.nativeElement as HTMLElement;
//     expect(compiled.querySelector('h1')?.textContent).toContain('Welcome web');
//   });
// });
