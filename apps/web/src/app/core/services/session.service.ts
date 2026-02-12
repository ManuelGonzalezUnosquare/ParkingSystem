import { computed, inject, Injectable } from '@angular/core';
import { RoleEnum } from '@parking-system/libs';
import { MenuItem } from 'primeng/api';
import { AuthStore } from '../stores/auth.store';
import { Router } from '@angular/router';

interface MyItem extends MenuItem {
  allowedRoles: string[];
  items?: MyItem[];
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  readonly token = computed(() => this.authStore.token());
  readonly user = computed(() => this.authStore.user());
  readonly role = computed(() => this.user()?.role);
  readonly isAdmin = computed(() => this.role() === RoleEnum.ADMIN);
  readonly isResident = computed(() => this.role() === RoleEnum.USER);

  readonly sideBarItems = computed<MenuItem[]>(() => {
    const currentRole = this.role();
    if (!currentRole) return [];

    return this.getFilteredMenu(currentRole);
  });

  logout() {
    this.authStore.logout();
    this.router.navigateByUrl('/auth/login');
  }

  navigateToPasswordRecoveryWithCode(code?: string) {
    //TODO: FIX THIS WITH ENV
    const isProd = false; //environment.isProd
    if (code && !isProd) {
      this.router.navigateByUrl('/auth/password-recovery' + code);
    }
  }

  private getFilteredMenu(role: string): MenuItem[] {
    const menuConfig: (MyItem & { allowedRoles: string[] })[] = [
      {
        label: 'Home',
        icon: 'pi pi-chart-bar',
        routerLink: '/app',
        allowedRoles: [RoleEnum.ROOT, RoleEnum.ADMIN, RoleEnum.USER],
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: 'Allocation History',
        icon: 'pi pi-building',
        routerLink: `buildings/${this.user()?.buildingId}/history`,
        allowedRoles: [RoleEnum.ADMIN],
        routerLinkActiveOptions: {
          exact: true,
        },
      },
      {
        label: 'Settings',
        icon: 'pi pi-map-marker',
        disabled: true,
        routerLink: '/parking-slots',
        allowedRoles: [RoleEnum.ROOT, RoleEnum.ADMIN],
      },

      {
        label: 'My Account',
        icon: 'pi pi-cog',
        routerLink: '/app/account',
        allowedRoles: [RoleEnum.USER, RoleEnum.ROOT, RoleEnum.ADMIN],
        routerLinkActiveOptions: {
          exact: true,
        },
      },
    ];

    return this.filterRecursive(menuConfig, role);
  }

  private filterRecursive(items: MyItem[], role: string): MenuItem[] {
    return items
      .filter((item) => item.allowedRoles.includes(role))
      .map((item) => {
        // Hacemos destructuring para separar nuestra propiedad de la que quiere PrimeNG
        const { allowedRoles, items: childItems, ...primeNGProps } = item;

        const result: MenuItem = {
          ...primeNGProps,
          // Si hay hijos, los filtramos recursivamente
          items: childItems
            ? this.filterRecursive(childItems, role)
            : undefined,
        };

        return result;
      });
  }
}
