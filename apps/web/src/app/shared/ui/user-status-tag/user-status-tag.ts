import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UserStatusEnum } from '@parking-system/libs';
import { TagModule } from 'primeng/tag';

type TagSeverity =
  | 'success'
  | 'secondary'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast'
  | undefined;

const STATUS_SEVERITY_MAP: Record<string, TagSeverity> = {
  [UserStatusEnum.ACTIVE]: 'success',
  [UserStatusEnum.INACTIVE]: 'warn',
};

@Component({
  selector: 'app-user-status-tag',
  imports: [TagModule],

  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-tag
      [pt]="{ host: 'bg-transparent' }"
      class="h-6 w-18"
      [value]="status()"
      [severity]="severity()"
    />
  `,
})
export class UserStatusTag {
  readonly status = input.required<string>();

  protected readonly severity = computed<TagSeverity>(() => {
    return STATUS_SEVERITY_MAP[this.status()] ?? undefined;
  });
}
