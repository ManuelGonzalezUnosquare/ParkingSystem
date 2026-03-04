import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-slot-assignation-tag',
  imports: [Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './slot-assignation-tag.html',
  styleUrl: './slot-assignation-tag.css',
})
export class SlotAssignationTag {
  slot = input<string>();

  severity = computed(() => {
    const current = this.slot();

    return current && current !== 'None' ? 'info' : 'secondary';
  });
  label = computed(() => {
    const current = this.slot();

    return current && current !== 'None' ? current : '--';
  });
}
