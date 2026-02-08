import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private authService: AuthService | undefined;

  constructor(private injector: Injector) { }

  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Não adicionar token para requisições de autenticação (se houver, o que não deve acontecer com SSO)
    // ou para a URL de validação de token do SSO
    if (request.url.includes('/auth/login') || request.url.includes(environment.ssoApiUrl)) {
      return next.handle(request);
    }

    const authService = this.getAuthService();

    // Adicionar token às requisições
    const token = authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    // Processar resposta e tratar erros de autenticação
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se o erro for 401 (Unauthorized), fazer logout para redirecionar ao SSO
        if (error.status === 401) {
          authService.logout();
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
}