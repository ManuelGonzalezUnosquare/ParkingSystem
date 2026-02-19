import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserForm } from './user-form';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BuildingDetailStore } from '@core/stores';
import { SessionService } from '@core/services';
import { RoleEnum } from '@parking-system/libs';
import { vi } from 'vitest';

describe('UserForm', () => {
  let component: UserForm;
  let fixture: ComponentFixture<UserForm>;

  const mockDialogRef = { close: vi.fn() };
  const mockDialogConfig = { data: { user: null } };

  const mockStore = {
    create: vi.fn(),
    update: vi.fn(),
    isLoading: vi.fn(() => false),
    callState: vi.fn(() => ({ res: 'IDLE' })),
  };

  const mockSessionService = {
    isAdmin: vi.fn(() => false),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [UserForm, ReactiveFormsModule],
      providers: [
        { provide: DynamicDialogRef, useValue: mockDialogRef },
        { provide: DynamicDialogConfig, useValue: mockDialogConfig },
        { provide: SessionService, useValue: mockSessionService },
        { provide: BuildingDetailStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call store.create when no user is provided', async () => {
    component.form.patchValue({
      firstName: 'John',
      email: 'john@test.com',
      role: RoleEnum.USER,
    });

    mockStore.create.mockResolvedValue(true);

    await component.doSubmit();

    expect(mockStore.create).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});
