import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleResultModel } from '@parking-system/libs';
import { SpotAssignamentTable } from './spot-assignament-table';

describe('SpotAssignmentTable', () => {
  let component: SpotAssignamentTable;
  let fixture: ComponentFixture<SpotAssignamentTable>;

  const mockHistory: RaffleResultModel[] = [
    {
      assignedDate: new Date('2026-02-15'),
      slotNumber: 'A-101',
      status: 'WINNER',
    } as any,
    {
      assignedDate: new Date('2026-02-14'),
      slotNumber: 'B-202',
      won: false,
    } as any,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotAssignamentTable],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotAssignamentTable);
    fixture.componentRef.setInput('history', []);
    fixture.componentRef.setInput('isLoading', false);
    component = fixture.componentInstance;
  });

  it('should render the correct number of rows', async () => {
    fixture.componentRef.setInput('history', mockHistory);
    fixture.detectChanges();
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should display "Not selected" when item.won is false', async () => {
    fixture.componentRef.setInput('history', [mockHistory[1]]);
    fixture.detectChanges();
    await fixture.whenStable();

    const outcomeCell = fixture.nativeElement.querySelector('td:last-child');
    expect(outcomeCell.textContent).toContain('No vehicle');
  });

  it('should show empty message when history is empty', async () => {
    fixture.componentRef.setInput('history', []);
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyMessage = fixture.nativeElement.querySelector('.text-gray-400');
    expect(emptyMessage.textContent).toContain(
      'No assignment history available',
    );
  });
});
