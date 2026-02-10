import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { FeedbackService } from '@core/services';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const feedback = inject(FeedbackService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isLoginAttempt = req.url.includes('/auth/login');

        if (!isLoginAttempt) {
          feedback.showError('Session expired. Please log in again.');
          // sService.logout();
          return throwError(() => error);
        }
      }

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
