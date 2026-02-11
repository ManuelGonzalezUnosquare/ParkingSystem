import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalResidentCard } from './total-resident-card';

describe('TotalResidentCard', () => {
  let component: TotalResidentCard;
  let fixture: ComponentFixture<TotalResidentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalResidentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalResidentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
