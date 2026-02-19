import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllocationHistory } from './allocation-history';
import { vi } from 'vitest';
import { BuildingDetailStore } from '@core/stores';

describe('AllocationHistory', () => {
  let component: AllocationHistory;
  let fixture: ComponentFixture<AllocationHistory>;

  const mockStore = {
    rafflesEntities: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationHistory],
      providers: [{ provide: BuildingDetailStore, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocationHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
