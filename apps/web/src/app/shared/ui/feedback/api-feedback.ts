import { Component, inject } from '@angular/core';
import { FeedbackService } from '@core/services';

@Component({
  selector: 'app-api-feedback',
  standalone: true,
  template: `
    @if (feedback(); as f) {
      <div
        class="p-4 mb-4 border-round animate-fade-in"
        [class.bg-red-100]="f.type === 'error'"
        [class.text-red-700]="f.type === 'error'"
      >
        <div class="flex justify-content-between align-items-center">
          <span>{{ f.message }}</span>
          <button (click)="close()" class="p-link text-red-700">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ApiFeedbackComponent {
  private feedbackService = inject(FeedbackService);

  // Escuchamos el signal global
  protected feedback = this.feedbackService.currentFeedback;

  close() {
    this.feedbackService.clear();
  }
}
