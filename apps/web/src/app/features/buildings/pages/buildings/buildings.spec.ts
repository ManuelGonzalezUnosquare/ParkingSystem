import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Buildings } from './buildings';
import { BuildingsStore } from '@core/stores';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

describe('Buildings Component', () => {
  let component: Buildings;
  let fixture: ComponentFixture<Buildings>;

  const mockConfirmationService = {
    confirm: vi.fn(),
    requireConfirmation$: new Subject<any>(),
    accept: new Subject<any>(),
    close: new Subject<any>(),
    onAccept: new Subject<any>(),
  };

  const mockDialogService = {
    open: vi.fn(),
  };

  const mockStore = {
    entities: vi.fn(() => []),
    pagination: vi.fn(() => ({ total: 0 })),
    isLoading: vi.fn(() => false),
    loadAll: vi.fn(),
    delete: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Buildings],
      providers: [
        provideRouter([]),
        { provide: BuildingsStore, useValue: mockStore },
      ],
    })

      .overrideComponent(Buildings, {
        set: {
          providers: [
            { provide: ConfirmationService, useValue: mockConfirmationService },
            { provide: DialogService, useValue: mockDialogService },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Buildings);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should request data on lazy load', () => {
    const event = { first: 0, rows: 10, sortField: 'name', sortOrder: 1 };

    component.onLazyLoad(event as any);

    expect(mockStore.loadAll).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 0,
        rows: 10,
      }),
    );
  });

  it('should trigger confirmation dialog when deleting a building', () => {
    const dummyBuilding = { name: 'Tower A', publicId: 'uuid-123' } as any;

    component.remove(dummyBuilding);

    expect(mockConfirmationService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Critical Action',
      }),
    );
  });

  it('should navigate to details when viewDetails is called', () => {
    const routerSpy = vi.spyOn(component['router'], 'navigate');
    const dummyBuilding = { publicId: 'uuid-123' } as any;

    component.viewDetails(dummyBuilding);

    expect(routerSpy).toHaveBeenCalledWith([
      '/app/buildings',
      'uuid-123',
      'details',
    ]);
  });

  it('should open building dialog when add is called', () => {
    component.add();

    expect(mockDialogService.open).toHaveBeenCalledWith(
      expect.any(Function), // El componente BuildingForm
      expect.objectContaining({
        header: 'Create New Building',
      }),
    );
  });
});
