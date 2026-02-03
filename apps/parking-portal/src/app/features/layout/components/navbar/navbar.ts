import { Component, OnInit, signal } from "@angular/core";
import { ToolbarModule } from "primeng/toolbar";

import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-navbar",
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    ToolbarModule,
    InputTextModule,
  ],
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.css",
})
export class Navbar implements OnInit {
  items = signal<MenuItem[]>([]);

  ngOnInit(): void {
    const isUser = false;
    const gItems: MenuItem[] = [
      {
        icon: "pi pi-bell",
      },
    ];
    let rItems: MenuItem[] = [];
    if (isUser) {
      rItems = this.userOptionsCreation();
    } else {
      rItems = this.adminOptionsCreation();
    }

    this.items.set([...rItems, ...gItems]);
  }
  private adminOptionsCreation(): MenuItem[] {
    return [];
  }
  private userOptionsCreation(): MenuItem[] {
    return [
      {
        label: "Dashboard",
      },
      {
        label: "My Account",
      },
      {
        label: "Support",
      },
    ];
  }
}
