import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlotAssignationTag } from './slot-assignation-tag';

describe('SlotAssignationTag', () => {
  let component: SlotAssignationTag;
  let fixture: ComponentFixture<SlotAssignationTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotAssignationTag],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotAssignationTag);
    fixture.componentRef.setInput('slot', 'None');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
