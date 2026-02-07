import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-buildings',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingLayout {}
