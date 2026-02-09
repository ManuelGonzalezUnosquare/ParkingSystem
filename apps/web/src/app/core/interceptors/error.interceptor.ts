import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { FeedbackService } from '@core/services';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const feedback = inject(FeedbackService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isValidationError = error.status === 422 || error.status === 400;

      if (!isValidationError) {
        // global: Red, 500, 403, 401
        const message = error.error?.message || 'Server connection failed';
        feedback.showError(message);
      }

      return throwError(() => error);
    }),
  );
};
