import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, CardModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <div
      class="flex-1 flex flex-col items-center justify-center bg-pattern p-6"
    >
      <p-card class="w-full max-w-120 shadow-xl rounded-xl border">
        <router-outlet />
        <ng-template #footer>
          <footer
            class="mt-8 text-center text-[#4b739b] text-xs"
            role="contentinfo"
          >
            <p>© 2026 Parking Lot Allocation System. All rights reserved.</p>
            <nav
              class="mt-2 flex gap-4 justify-center"
              aria-label="Legal links"
            >
              <a
                class="hover:text-primary underline focus:ring-2 focus:ring-primary outline-hidden"
                routerLink="/privacy"
                title="Read our Privacy Policy"
              >
                Privacy Policy
              </a>
              <a
                class="hover:text-primary underline focus:ring-2 focus:ring-primary outline-hidden"
                routerLink="/terms"
                title="Read our Terms of Service"
              >
                Terms of Service
              </a>
            </nav>
          </footer>
        </ng-template>
      </p-card>
    </div>
  `,
})
export class AuthLayout {}
