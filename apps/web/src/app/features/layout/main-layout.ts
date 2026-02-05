import { Component, inject } from "@angular/core";
import { Navbar, Sidebar } from "./components";
import { RouterOutlet } from "@angular/router";
import { AuthStore } from "../auth/auth.store";

@Component({
  selector: "app-main-layout",
  imports: [Sidebar, Navbar, RouterOutlet],
  templateUrl: "./main-layout.html",
  styleUrl: "./main-layout.css",
})
export class MainLayout {
  authStore = inject(AuthStore);
}
