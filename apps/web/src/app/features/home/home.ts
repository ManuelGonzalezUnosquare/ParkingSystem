import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  Type,
} from '@angular/core';
import { AuthStore } from '@core/stores';
import { RoleEnum } from '@parking-system/libs';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    @if (loadedComponent(); as comp) {
      <ng-container *ngComponentOutlet="comp; inputs: componentInputs()" />
    } @else {
      <div
        class="flex text-gray-500 flex-column items-center justify-center p-8 gap-3"
      >
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <span class=" font-medium">Loading your workspace...</span>
      </div>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly authStore = inject(AuthStore);

  protected readonly loadedComponent = signal<Type<any> | null>(null);

  protected readonly componentInputs = computed(() => {
    const user = this.authStore.user();
    if (user && user.role.name !== RoleEnum.ROOT) {
      return { id: user.building?.publicId };
    }
    return {};
  });

  constructor() {
    effect(
      async () => {
        const user = this.authStore.user();

        if (!user) {
          this.loadedComponent.set(null);
          return;
        }

        if (this.loadedComponent()) return;

        try {
          const role = user.role.name;
          let component: Type<any>;

          if (role === RoleEnum.ROOT) {
            const m = await import('../buildings/pages/buildings/buildings');
            component = m.Buildings;
          } else {
            const m = await import(
              '../buildings/pages/building-details/building-details'
            );
            component = m.BuildingDetails;
          }

          this.loadedComponent.set(component);
        } catch (error) {
          console.error('Error lazy-loading component:', error);
        }
      },
      { allowSignalWrites: true },
    );
  }
}
