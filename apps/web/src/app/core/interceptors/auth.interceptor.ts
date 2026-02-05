import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const service = inject(SessionService);
  let token = service.token();

  if (!token) {
    service.loadSession();
    token = service.token();
  }

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }
  return next(req);
};
