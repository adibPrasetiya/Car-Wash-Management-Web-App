import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (token expired)
      if (error.status === 401 && token) {
        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
          // Try to refresh the token
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              const newToken = authService.getAccessToken();
              const retryReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token, logout user
          authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};
