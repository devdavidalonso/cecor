import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Não adicionar token para requisições de autenticação
    if (request.url.includes('/auth/login') || request.url.includes('/auth/refresh')) {
      return next.handle(request);
    }
    
    // Adicionar token às requisições
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }
    
    // Processar resposta e tratar erros de autenticação
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se o erro for 401 (Unauthorized), tentar renovar o token
        if (error.status === 401 && !request.url.includes('/auth/refresh')) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }
  
  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Tentar renovar o token
    return this.authService.refreshToken().pipe(
      switchMap(token => {
        // Reenviar a requisição original com o novo token
        return next.handle(this.addToken(request, token));
      }),
      catchError(error => {
        // Se não for possível renovar o token, fazer logout
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}