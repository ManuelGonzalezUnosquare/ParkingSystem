import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersTable } from './users-table';
import { UserModel } from '@parking-system/libs';

describe('UsersTable', () => {
  let component: UsersTable;
  let fixture: ComponentFixture<UsersTable>;
  const users: UserModel[] = [];
  const isLoading = false;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersTable],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersTable);
    fixture.componentRef.setInput('users', users);
    fixture.componentRef.setInput('isLoading', isLoading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
