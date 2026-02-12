// src/app/app.config.ts
import { ApplicationConfig, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MAT_DATE_LOCALE } from '@angular/material/core';

registerLocaleData(localePt);

// Provider Factory para serviços que precisam de versões mockadas no modo protótipo
import { cursoServiceFactory } from './core/factories/curso-service.factory';
import { CursoService } from './core/services/curso.service';
import { PrototypeService } from './core/services/prototype/prototype.service';
import { SsoService } from './core/services/sso.service';

// Factory para inicialização do SSO
export function initializeSso(ssoService: SsoService) {
  return () => ssoService.initSso();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Remove withEnabledBlockingInitialNavigation to let SSO process URL first
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideOAuthClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Inicialização do SSO antes do bootstrap da aplicação
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSso,
      deps: [SsoService],
      multi: true
    },
    // Provider para o serviço de curso (real ou mockado)
    {
      provide: CursoService,
      useFactory: cursoServiceFactory
    },
    // Serviço de protótipo (sempre disponível)
    PrototypeService,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
};