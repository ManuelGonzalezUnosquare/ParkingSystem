import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiclesCard } from './vehicles-card';
import { RoleEnum, UserModel } from '@parking-system/libs';

describe('VehiclesCard', () => {
  let component: VehiclesCard;
  let fixture: ComponentFixture<VehiclesCard>;

  const mockUsers: Partial<UserModel>[] = [
    { hasVehicle: true, role: RoleEnum.USER },
    { hasVehicle: true, role: RoleEnum.USER },
    { hasVehicle: false, role: RoleEnum.USER },
    { hasVehicle: true, role: RoleEnum.USER },
    { hasVehicle: false, role: RoleEnum.USER },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesCard);
    component = fixture.componentInstance;
  });

  it('should correctly count users with and without vehicles', async () => {
    fixture.componentRef.setInput('users', mockUsers);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['usersWithVehicle']()).toBe(3);
    expect(component['usersWithoutVehicle']()).toBe(2);
  });

  it('should display the correct values in the UI', async () => {
    fixture.componentRef.setInput('users', mockUsers);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const totalDisplay = compiled
      .querySelector('.text-4xl')
      ?.textContent?.trim();
    const withoutDisplay = compiled
      .querySelector('.text-cyan-700')
      ?.textContent?.trim();

    expect(totalDisplay).toBe('3');
    expect(withoutDisplay).toBe('2');
  });

  it('should return zeros when user list is empty', async () => {
    fixture.componentRef.setInput('users', []);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['usersWithVehicle']()).toBe(0);
    expect(component['usersWithoutVehicle']()).toBe(0);
  });
});
