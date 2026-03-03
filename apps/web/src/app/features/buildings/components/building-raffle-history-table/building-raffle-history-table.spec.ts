import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingRaffleHistoryTable } from './building-raffle-history-table';

describe('BuildingRaffleHistoryTable', () => {
  let component: BuildingRaffleHistoryTable;
  let fixture: ComponentFixture<BuildingRaffleHistoryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingRaffleHistoryTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingRaffleHistoryTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
