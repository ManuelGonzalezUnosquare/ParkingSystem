import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleInfo } from './vehicle-info';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { UserModel } from '@parking-system/libs';

describe('VehicleInfo', () => {
  let component: VehicleInfo;
  let fixture: ComponentFixture<VehicleInfo>;

  const mockUserWithVehicle: Partial<UserModel> = {
    hasVehicle: true,
    vehiclePlate: 'ABC-123',
    vehicleDescription: 'Tesla Model 3 - Black',
    assignedSlotNumber: 'S-001',
  };

  const mockUserWithoutVehicle: Partial<UserModel> = {
    hasVehicle: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleInfo, CardModule, ButtonModule, TagModule],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleInfo);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('user', mockUserWithVehicle);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('When user HAS a vehicle', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('user', mockUserWithVehicle);
      fixture.detectChanges();
    });

    it('should show the vehicle plate correctly', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const plateElement = compiled.querySelector('.font-mono');
      expect(plateElement?.textContent?.trim()).toBe(
        mockUserWithVehicle.vehiclePlate,
      );
    });

    it('should show the vehicle description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain(
        mockUserWithVehicle.vehicleDescription,
      );
    });

    it('should render the assigned slot in a p-tag', () => {
      const tag = fixture.nativeElement.querySelector('p-tag');
      expect(tag).toBeTruthy();

      expect(tag.textContent).toContain(mockUserWithVehicle.assignedSlotNumber);
    });

    it('should not show the "No Vehicle Linked" message', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('No Vehicle Linked');
    });
  });

  describe('When user DOES NOT HAVE a vehicle', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('user', mockUserWithoutVehicle);
      fixture.detectChanges();
    });

    it('should show the warning title "No Vehicle Linked"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const warningTitle = compiled.querySelector('h3');
      expect(warningTitle?.textContent).toContain('No Vehicle Linked');
    });

    it('should show the call to action message to contact admin', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('You need a registered vehicle');
    });

    it('should render the "Contact Administrator" button', () => {
      const button = fixture.nativeElement.querySelector('p-button');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Contact Administrator');
    });

    it('should show the alert icon or indicator', () => {
      const alertBadge = fixture.nativeElement.querySelector('.bg-rose-500');
      expect(alertBadge).toBeTruthy();
      expect(alertBadge.textContent).toBe('!');
    });
  });
});
