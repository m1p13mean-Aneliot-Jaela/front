import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // With HttpOnly cookies, the browser automatically sends cookies.
    // We just need to ensure withCredentials is true for cross-origin requests.
    const authReq = req.clone({
      withCredentials: true
    });

    return next.handle(authReq);
  }
}
