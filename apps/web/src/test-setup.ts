// import 'jest-preset-angular/setup-jest';
import 'jest-preset-angular/setup-jest';
declare const jest: any;

// Definimos el mock con tipos para que TS no se queje
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Ahora Jest debería ser reconocido
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

// Mock necesario para componentes de PrimeNG que usan animaciones o posicionamiento
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    display: 'none',
    appearance: ['none'],
  }),
});
