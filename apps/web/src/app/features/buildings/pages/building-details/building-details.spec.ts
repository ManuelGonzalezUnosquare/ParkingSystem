import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingDetails } from './building-details';
import { BuildingDetailStore } from '@core/stores';
import { vi } from 'vitest';

describe('BuildingDetails', () => {
  let component: BuildingDetails;
  let fixture: ComponentFixture<BuildingDetails>;

  const mockStore = {
    loadById: vi.fn(),
    loadUsers: vi.fn(),
    building: vi.fn(() => ({ name: 'Test Building', publicId: 'b-123' })),
    usersEntities: vi.fn(() => []),
    usersPagination: vi.fn(() => ({ total: 0 })),
    isLoading: vi.fn(() => false),
    isRaffling: vi.fn(() => false),
    liveRaffle: vi.fn(() => null),
    residentCount: vi.fn(() => 0),
    resetState: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingDetails],
      providers: [{ provide: BuildingDetailStore, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingDetails);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '123');
  });

  it('should load building data on init', () => {
    fixture.detectChanges();
    expect(mockStore.loadById).toHaveBeenCalledWith('123');
  });

  it('should trigger store.loadUsers when table signals lazy load', () => {
    const event = { first: 0, rows: 10, globalFilter: 'John' };
    component.onLazyLoad(event as any);

    expect(mockStore.loadUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        globalFilter: 'John',
        buildingId: '123',
      }),
    );
  });
});
