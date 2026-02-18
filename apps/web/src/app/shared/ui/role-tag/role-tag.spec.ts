import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleTag } from './role-tag';
import { RoleEnum } from '@parking-system/libs';
import { By } from '@angular/platform-browser';
import { Tag } from 'primeng/tag';

describe('RoleTag', () => {
  let fixture: ComponentFixture<RoleTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleTag],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleTag);
  });

  it('should render the role in uppercase', async () => {
    fixture.componentRef.setInput('role', RoleEnum.ADMIN);

    fixture.detectChanges();
    await fixture.whenStable();

    const tagElement = fixture.nativeElement.querySelector('p-tag');
    expect(tagElement.textContent).toContain('ADMIN');
  });

  it('should apply "success" severity for ADMIN role', async () => {
    fixture.componentRef.setInput('role', RoleEnum.ADMIN);

    fixture.detectChanges();
    await fixture.whenStable();

    const tagComponent = fixture.debugElement.query(
      By.directive(Tag),
    ).componentInstance;
    expect(tagComponent.severity).toBe('success');
  });

  it('should apply "danger" severity for ROOT role', async () => {
    fixture.componentRef.setInput('role', RoleEnum.ROOT);

    fixture.detectChanges();
    await fixture.whenStable();

    const tagComponent = fixture.debugElement.query(
      By.directive(Tag),
    ).componentInstance;
    expect(tagComponent.severity).toBe('danger');
  });

  it('should fallback to "secondary" for unknown roles', async () => {
    fixture.componentRef.setInput('role', RoleEnum.USER);

    fixture.detectChanges();
    await fixture.whenStable();

    const tagComponent = fixture.debugElement.query(
      By.directive(Tag),
    ).componentInstance;
    expect(tagComponent.severity).toBe('info');
  });

  it('should apply rounded class when rounded input is true', async () => {
    fixture.componentRef.setInput('role', 'user');
    fixture.componentRef.setInput('rounded', true);

    fixture.detectChanges();
    await fixture.whenStable();

    const tagComponent = fixture.debugElement.query(
      By.directive(Tag),
    ).componentInstance;
    expect(tagComponent.rounded).toBe(true);
  });
});
