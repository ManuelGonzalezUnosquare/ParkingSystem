import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiclesCard } from './vehicles-card';

describe('VehiclesCard', () => {
  let component: VehiclesCard;
  let fixture: ComponentFixture<VehiclesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
