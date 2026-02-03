import { inject, Injectable } from "@angular/core";
import { LoginDto, Session } from "@org/shared-models";
import { Observable } from "rxjs";
import { RequestService } from "../../core/services";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly request = inject(RequestService);
  private readonly endpoint = "/api/auth";

  login(credentials: LoginDto): Observable<Session> {
    return this.request.post<Session>(`${this.endpoint}/login`, credentials);
  }
}
