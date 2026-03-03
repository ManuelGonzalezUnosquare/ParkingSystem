import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingRaffleHistoryTable } from './building-raffle-history-table';
import { RaffleHistoryModel } from '@parking-system/libs';

describe('BuildingRaffleHistoryTable', () => {
  let component: BuildingRaffleHistoryTable;
  let fixture: ComponentFixture<BuildingRaffleHistoryTable>;
  const raffles: RaffleHistoryModel[] = [];
  const isLoading = false;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingRaffleHistoryTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingRaffleHistoryTable);
    fixture.componentRef.setInput('raffles', raffles);
    fixture.componentRef.setInput('isLoading', isLoading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
