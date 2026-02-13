import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiUrl = !req.url.startsWith('http');

  if (isApiUrl) {
    const target = req.url.startsWith('/') ? '' : '/';
    const apiReq = req.clone({
      url: `${environment.apiUrl}${target}${req.url}`,
    });
    return next(apiReq);
  }

  return next(req);
};
