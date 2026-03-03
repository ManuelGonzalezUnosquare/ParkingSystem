import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleResult } from './raffle-result';

describe('RaffleResult', () => {
  let component: RaffleResult;
  let fixture: ComponentFixture<RaffleResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaffleResult],
    }).compileComponents();

    fixture = TestBed.createComponent(RaffleResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
