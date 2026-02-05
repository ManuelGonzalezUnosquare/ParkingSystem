import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly tokenName = 'token';
  readonly token = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const cToken = this.token();
      if (cToken) {
        if (!localStorage.getItem(this.tokenName)) {
          localStorage.setItem(this.tokenName, cToken);
        }
      }
    });
    this.loadSession();
  }

  loadSession(token?: string) {
    const cToken = this.token();

    if (token) {
      if (!cToken) {
        this.token.set(token);
      }
      return;
    }

    if (!cToken) {
      const storedToken = localStorage.getItem(this.tokenName);
      if (storedToken) {
        this.token.set(storedToken);
      }
    }
  }

  logout() {
    this.clearToken();
  }

  private clearToken() {
    this.token.set(undefined);
    localStorage.removeItem(this.tokenName);
  }
}
