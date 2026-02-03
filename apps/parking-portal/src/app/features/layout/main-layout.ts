import { Component } from "@angular/core";
import { Navbar, Sidebar } from "./components";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-main-layout",
  imports: [Sidebar, Navbar, RouterOutlet],
  templateUrl: "./main-layout.html",
  styleUrl: "./main-layout.css",
})
export class MainLayout {}
