import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../auth.store";

export const roleGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Obtenemos los roles permitidos desde la configuración de la ruta
  const expectedRoles = route.data["roles"] as Array<string>;
  const userRole = authStore.user()?.role.name;

  if (authStore.token() && expectedRoles.includes(userRole ?? "")) {
    return true;
  }

  // Si no tiene el rol, lo mandamos a una página de "No autorizado" o al dashboard
  router.navigate(["/unauthorized"]);
  return false;
};
