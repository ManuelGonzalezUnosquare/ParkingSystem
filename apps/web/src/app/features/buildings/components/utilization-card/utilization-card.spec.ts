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
  });

  it('should calculate 0% if availableSpots is 0 (division by zero protection)', () => {
    fixture.componentRef.setInput('availableSpots', 0);
    fixture.componentRef.setInput('users', [{ hasVehicle: true }]);

    fixture.detectChanges();
    expect(component['progressValue']()).toBe(0);
  });

  it('should return Emerald color and Optimal status for low utilization', () => {
    fixture.componentRef.setInput('availableSpots', 10);
    fixture.componentRef.setInput('users', [
      { hasVehicle: true },
      { hasVehicle: true },
    ]); // 20%

    fixture.detectChanges();
    expect(component['progressColor']()).toBe('var(--p-emerald-500)');
    expect(component['utilizationStatus']()).toBe('Optimal');
  });

  it('should return Red color and Full status for 100% utilization', () => {
    fixture.componentRef.setInput('availableSpots', 2);
    fixture.componentRef.setInput('users', [
      { hasSlot: true },
      { hasSlot: true },
    ]); // 100%

    fixture.detectChanges();
    expect(component['progressValue']()).toBe(100);
    expect(component['progressColor']()).toBe('var(--p-red-500)');
    expect(component['utilizationStatus']()).toBe('Full');
  });
});
