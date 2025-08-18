import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe();
  // Nota: Placeholder simple. Puedes añadir catchError para mapear y mostrar errores globales.
  // Ejemplo:
  // return next(req).pipe(
  //   catchError((error: HttpErrorResponse) => {
  //     console.error('HTTP error', error);
  //     return throwError(() => error);
  //   })
  // );
};

