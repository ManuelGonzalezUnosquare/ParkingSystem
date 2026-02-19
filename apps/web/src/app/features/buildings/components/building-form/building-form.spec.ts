import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingsStore } from '@core/stores';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { vi } from 'vitest';
import { BuildingForm } from './building-form';

describe('BuildingForm within DynamicDialog', () => {
  let component: BuildingForm;
  let fixture: ComponentFixture<BuildingForm>;

  const mockRef = { close: vi.fn() };
  const mockConfig = { data: { building: undefined as any } };
  const mockStore = {
    update: vi.fn(),
    create: vi.fn(),
    isLoading: vi.fn(() => false),
    callState: vi.fn(() => ({ res: 'init' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingForm],
      providers: [
        { provide: DynamicDialogRef, useValue: mockRef },
        { provide: DynamicDialogConfig, useValue: mockConfig },
        { provide: BuildingsStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingForm);
    component = fixture.componentInstance;
  });

  it('should initialize as CREATE mode if no building data is provided', () => {
    fixture.detectChanges();
    expect(component['building']).toBeUndefined();
    expect(component.form.controls.name.value).toBe('');
  });

  it('should initialize as EDIT mode and patch values if building data exists', () => {
    const mockBuilding = {
      name: 'Tower A',
      address: 'Street 1',
      totalSlots: 10,
    };
    mockConfig.data.building = mockBuilding; // Inyectamos data

    fixture.detectChanges();

    expect(component.form.controls.name.value).toBe('Tower A');
    expect(component.form.controls.totalSlots.value).toBe(10);
  });

  it('should call store.update when in edit mode', async () => {
    const mockBuilding = { publicId: '123', name: 'A' };
    component['building'] = mockBuilding as any;
    const payload = {
      name: 'New Name',
      address: 'Add',
      totalSlots: 5,
    };

    component.form.patchValue(payload);
    mockStore.update.mockResolvedValue(true);
    fixture.detectChanges();
    await component.doSubmit();

    expect(mockStore.update).toHaveBeenCalled();
  });
});
