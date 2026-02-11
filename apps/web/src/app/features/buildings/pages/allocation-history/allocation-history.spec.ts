import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllocationHistory } from './allocation-history';

describe('AllocationHistory', () => {
  let component: AllocationHistory;
  let fixture: ComponentFixture<AllocationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocationHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
