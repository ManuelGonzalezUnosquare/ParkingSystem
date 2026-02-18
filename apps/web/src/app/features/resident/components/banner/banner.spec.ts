import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Banner } from './banner';
import { UserModel, RaffleModel } from '@parking-system/libs';

describe('Banner Component', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  const mockUser: UserModel = {
    firstName: 'John',
    buildingName: 'Skyline Tower',
  } as any;

  const mockRaffle: RaffleModel = {
    executionDate: new Date('2026-12-01T10:00:00'),
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banner],
    }).compileComponents();

    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;
  });

  it('should display the user first name and building', async () => {
    fixture.componentRef.setInput('user', mockUser);

    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.nativeElement.querySelector('h1');
    const description = fixture.nativeElement.querySelector('p');

    expect(title.textContent).toContain('John');
    expect(description.textContent).toContain('Skyline Tower');
  });

  it('should show raffle information when nextRaffle is provided', async () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('nextRaffle', mockRaffle);

    fixture.detectChanges();
    await fixture.whenStable();

    const timeElement = fixture.nativeElement.querySelector('time');
    expect(timeElement).toBeTruthy();
    // Verificamos que el datePipe esté funcionando (formato por defecto)
    expect(timeElement.textContent).toBeTruthy();
  });

  it('should hide raffle section when nextRaffle is null', async () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('nextRaffle', null);

    fixture.detectChanges();
    await fixture.whenStable();

    const timeElement = fixture.nativeElement.querySelector('time');
    expect(timeElement).toBeNull();
  });

  it('should have correct accessibility roles', () => {
    const card = fixture.nativeElement.querySelector('p-card');
    expect(card.getAttribute('role')).toBe('region');
  });
});
