import { Route } from "@angular/router";
import { MainLayout } from "./features/layout/main-layout";

export const appRoutes: Route[] = [
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "",
    component: MainLayout,
    children: [],
  },
  {
    path: "",
    redirectTo: "auth/login",
    pathMatch: "full",
  },
  {
    path: "**", // Comodín para 404
    redirectTo: "auth/login",
  },
];
