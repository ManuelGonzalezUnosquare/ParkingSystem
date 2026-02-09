import { Injectable, signal } from '@angular/core';

export interface FeedbackMessage {
  message: string;
  type: 'error' | 'success' | 'info';
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  // Usamos un signal para el mensaje actual
  private _currentFeedback = signal<FeedbackMessage | null>(null);

  // Exposición pública (Solo lectura)
  readonly currentFeedback = this._currentFeedback.asReadonly();

  showError(message: string, code?: string) {
    this._currentFeedback.set({ message, type: 'error', code });
    // Auto-limpieza opcional después de 5 segundos
    setTimeout(() => this.clear(), 5000);
  }

  clear() {
    this._currentFeedback.set(null);
  }
}
