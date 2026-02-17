import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalResidentCard } from './total-resident-card';
import { RoleEnum, UserModel } from '@parking-system/libs';

describe('TotalResidentCard', () => {
  let component: TotalResidentCard;
  let fixture: ComponentFixture<TotalResidentCard>;

  const mockUsers: Partial<UserModel>[] = [
    { role: RoleEnum.USER },
    { role: RoleEnum.USER },
    { role: RoleEnum.ADMIN },
    { role: RoleEnum.ROOT }, // Este no debería contarse en ninguno de los dos
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalResidentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalResidentCard);
    component = fixture.componentInstance;
  });

  it('should calculate counts correctly', async () => {
    fixture.componentRef.setInput('users', mockUsers);

    // Forzamos procesamiento de signals
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['residentCount']()).toBe(2);
    expect(component['adminCount']()).toBe(1);
  });

  it('should display the counts in the template', async () => {
    fixture.componentRef.setInput('users', mockUsers);

    fixture.detectChanges();
    await fixture.whenStable();

    const rootElement: HTMLElement = fixture.nativeElement;
    const countDisplay = rootElement.querySelector('.text-4xl');
    const adminDisplay = rootElement.querySelector('.text-emerald-700');

    expect(countDisplay?.textContent?.trim()).toBe('2');
    expect(adminDisplay?.textContent?.trim()).toBe('+1');
  });

  it('should handle empty user list', async () => {
    fixture.componentRef.setInput('users', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['residentCount']()).toBe(0);
    expect(component['adminCount']()).toBe(0);
  });
});
