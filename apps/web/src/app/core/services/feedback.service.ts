import { inject, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface FeedbackMessage {
  message: string;
  type: 'error' | 'success' | 'info';
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private messageService = inject(MessageService);
  private _currentFeedback = signal<FeedbackMessage | null>(null);
  private readonly lifeTime = 5000;
  readonly currentFeedback = this._currentFeedback.asReadonly();
  //TODO: handle sticky messages for critical errors

  showError(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary || 'Error',
      detail: detail || 'Operation failed',
      life: this.lifeTime,
    });
  }

  showSuccess(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary || 'Success',
      detail: detail || 'Action completed successfully',
      life: this.lifeTime,
    });
  }

  showInfo(summary: string, detail?: string) {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: this.lifeTime,
    });
  }
  clear() {
    this.messageService.clear();
  }
}
