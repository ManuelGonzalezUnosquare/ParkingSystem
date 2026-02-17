import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RoleEnum } from '@parking-system/libs';
import { TagModule } from 'primeng/tag';

type TagSeverity =
  | 'success'
  | 'secondary'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast'
  | undefined;

const ROLE_SEVERITY_MAP: Record<string, TagSeverity> = {
  [RoleEnum.ROOT]: 'danger',
  [RoleEnum.ADMIN]: 'success',
  [RoleEnum.USER]: 'info',
};

@Component({
  selector: 'app-role-tag',
  standalone: true,
  imports: [TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-tag
      class="h-6 w-18"
      [value]="role()"
      [severity]="severity()"
      [rounded]="rounded()"
    />
  `,
})
export class RoleTag {
  readonly role = input.required<string>();
  rounded = input<boolean>(false);

  protected readonly severity = computed<TagSeverity>(() => {
    return ROLE_SEVERITY_MAP[this.role()] ?? 'info';
  });
}
