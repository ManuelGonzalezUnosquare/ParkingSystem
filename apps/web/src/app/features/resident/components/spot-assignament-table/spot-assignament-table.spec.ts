import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotAssignamentTable } from './spot-assignament-table';

describe('SpotAssignamentTable', () => {
  let component: SpotAssignamentTable;
  let fixture: ComponentFixture<SpotAssignamentTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotAssignamentTable],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotAssignamentTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
