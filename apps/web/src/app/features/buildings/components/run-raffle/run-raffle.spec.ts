import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunRaffle } from './run-raffle';
import { vi } from 'vitest';
import { BuildingDetailStore } from '@core/stores';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

describe('RunRaffle', () => {
  let component: RunRaffle;
  let fixture: ComponentFixture<RunRaffle>;
  const mockDialogRef = { close: vi.fn() };

  const mockStore = {
    liveRaffle: vi.fn(() => null),
    runRaffle: vi.fn(),
    loading: vi.fn(() => false),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RunRaffle],
      providers: [
        { provide: DynamicDialogRef, useValue: mockDialogRef },
        { provide: BuildingDetailStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RunRaffle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call store.runRaffle when user clicks on primary button', async () => {
    await component.doSubmit();
    mockStore.loading.mockResolvedValue(true);

    expect(mockStore.runRaffle).toHaveBeenCalled();
  });
});
