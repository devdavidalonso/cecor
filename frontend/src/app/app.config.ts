// src/app/app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

// Provider Factory para serviços que precisam de versões mockadas no modo protótipo
import { cursoServiceFactory } from './core/factories/curso-service.factory';
import { CursoService } from './core/services/curso.service';
import { MockCursoService } from './core/services/prototype/mock-curso.service';
import { PrototypeService } from './core/services/prototype/prototype.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Provider para o serviço de curso (real ou mockado)
    {
      provide: CursoService,
      useFactory: cursoServiceFactory
    },
    // Serviço de protótipo (sempre disponível)
    PrototypeService
  ]
};