import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleUserResultTag } from './raffle-user-result-tag';

describe('RaffleUserResultTag', () => {
  let component: RaffleUserResultTag;
  let fixture: ComponentFixture<RaffleUserResultTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaffleUserResultTag],
    }).compileComponents();

    fixture = TestBed.createComponent(RaffleUserResultTag);
    fixture.componentRef.setInput('status', 'WINNER');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
