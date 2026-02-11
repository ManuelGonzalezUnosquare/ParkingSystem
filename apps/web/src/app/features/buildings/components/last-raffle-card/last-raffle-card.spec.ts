import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LastRaffleCard } from './last-raffle-card';

describe('LastRaffleCard', () => {
  let component: LastRaffleCard;
  let fixture: ComponentFixture<LastRaffleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastRaffleCard],
    }).compileComponents();

    fixture = TestBed.createComponent(LastRaffleCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
