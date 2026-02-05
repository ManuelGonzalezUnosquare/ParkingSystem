import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CardModule } from "primeng/card";

@Component({
  selector: "app-auth-layout",
  imports: [RouterOutlet, CardModule],
  templateUrl: "./auth-layout.html",
  styleUrl: "./auth-layout.css",
})
export class AuthLayout {}
