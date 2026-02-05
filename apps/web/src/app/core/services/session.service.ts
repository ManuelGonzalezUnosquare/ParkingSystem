import { computed, inject, Injectable } from '@angular/core';
import { RoleEnum } from '@parking-system/libs';
import { MenuItem } from 'primeng/api';
import { AuthStore } from '../../features/auth/auth.store';
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
  readonly role = computed(() => this.user()?.role?.name);

  readonly sideBarItems = computed<MenuItem[]>(() => {
    const currentRole = this.role();
    if (!currentRole) return [];

    return this.getFilteredMenu(currentRole);
  });

  logout() {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }

  private getFilteredMenu(role: string): MenuItem[] {
    const menuConfig: (MyItem & { allowedRoles: string[] })[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        routerLink: '/app',
        allowedRoles: [RoleEnum.ROOT],
      },
      {
        label: 'Buildings',
        icon: 'pi pi-users',
        routerLink: '/admin/users',
        allowedRoles: [RoleEnum.ROOT],
      },
      {
        label: 'Resident List',
        icon: 'pi pi-users',
        routerLink: '/admin/users',
        allowedRoles: [RoleEnum.ADMIN],
      },
      {
        label: 'Allocation History',
        icon: 'pi pi-building',
        routerLink: '/admin/buildings',
        allowedRoles: [RoleEnum.ADMIN],
      },
      {
        label: 'Settings',
        icon: 'pi pi-map-marker',
        disabled: true,
        routerLink: '/parking-slots',
        allowedRoles: [RoleEnum.ROOT],
      },
    ];

    const resItems = this.filterRecursive(menuConfig, role);
    console.log('resItems:', resItems);
    return resItems;
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
