import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilizationCard } from './utilization-card';

describe('UtilizationCard', () => {
  let component: UtilizationCard;
  let fixture: ComponentFixture<UtilizationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizationCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilizationCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
