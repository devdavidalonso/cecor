---
name: angular-performance
description: Boas práticas de performance para Angular 17+ no CECOR
---

# Angular Performance Guide - CECOR

Guia de otimização de performance baseado na análise do projeto.

---

## 📊 Status Atual do Projeto

```
Bundle Size:     1.25 MB (⚠️ Acima do ideal de 1 MB)
Lazy Loading:    100% ✅
Standalone:      Sim ✅
PWA:             Configurado ✅
```

---

## 🎯 Metas de Performance

| Métrica | Atual | Meta | Prioridade |
|---------|-------|------|------------|
| Bundle Initial | 1.25 MB | < 800 KB | 🔴 Alta |
| First Contentful Paint | ~2s | < 1.5s | 🔴 Alta |
| Time to Interactive | ~3s | < 2s | 🟡 Média |
| Lighthouse Score | ~70 | > 90 | 🟡 Média |

---

## 1. Otimização de Bundle

### 1.1 Analisar Bundle Atual

```bash
# Gerar build com estatísticas
ng build --configuration production --stats-json

# Analisar visualmente
npx webpack-bundle-analyzer dist/browser/stats.json
```

### 1.2 Remover MirageJS da Produção

```typescript
// core/mock/server.ts
import { environment } from '../../../environments/environment';

export function setupMirageServer() {
  // ❌ NÃO carregar em produção
  if (environment.production) {
    console.warn('MirageJS não deve ser usado em produção');
    return;
  }
  
  // ... resto do código
}
```

### 1.3 Otimizar Imports do Material

```typescript
// ❌ EVITAR - Import genérico que traz tudo
import { MatMaterialModule } from '../material.module';

// ✅ USAR - Imports específicos
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
```

---

## 2. Change Detection OnPush

### 2.1 Implementar OnPush

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-student-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ Adicionar
  template: `
    @for (student of students(); track student.id) {
      <app-student-card [student]="student" />
    }
  `
})
export class StudentListComponent {
  // ✅ Usar Signals (Angular 16+)
  students = signal<Student[]>([]);
  
  // ✅ Ou Observables com async pipe
  students$ = this.studentService.getStudents();
}
```

### 2.2 Benefícios

- Reduz ciclos de detecção de mudanças
- Melhora performance em 30-50%
- Menor consumo de bateria em mobile

---

## 3. Virtual Scrolling

### 3.1 Para Listas Grandes (> 50 itens)

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport 
      itemSize="72" 
      class="student-list">
      <app-student-row 
        *cdkVirtualFor="let student of students; trackBy: trackById"
        [student]="student">
      </app-student-row>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .student-list {
      height: 500px;
      width: 100%;
    }
  `]
})
export class StudentListComponent {
  students: Student[] = []; // Lista pode ter milhares de itens
  
  trackById(index: number, student: Student): number {
    return student.id;
  }
}
```

---

## 4. Image Optimization

### 4.1 Usar NgOptimizedImage

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <!-- ✅ Imagem com prioridade (above the fold) -->
    <img [ngSrc]="heroImage" 
         width="800" 
         height="400" 
         priority
         alt="Banner" />
    
    <!-- ✅ Imagem lazy loaded -->
    <img [ngSrc]="student.photo" 
         width="200" 
         height="200"
         [alt]="student.name" />
  `
})
```

### 4.2 Otimização de Assets

```json
// angular.json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": {
                "scripts": true,
                "styles": {
                  "minify": true,
                  "inlineCritical": true  // ✅ CSS crítico inline
                },
                "fonts": true  // ✅ Otimização de fontes
              },
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": true  // ✅ Separa vendor do main
            }
          }
        }
      }
    }
  }
}
```

---

## 5. Preloading de Módulos

### 5.1 Estratégia de Preloading

```typescript
// app.config.ts
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)  // ✅ Carrega em background
    )
  ]
};
```

### 5.2 Custom Preloading

```typescript
// core/strategies/custom-preloading.strategy.ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Pré-carrega apenas rotas marcadas
    if (route.data?.['preload']) {
      // Delay de 5s para não competir com carregamento inicial
      return timer(5000).pipe(mergeMap(() => load()));
    }
    return of(null);
  }
}

// Uso
{
  path: 'reports',
  loadChildren: () => import('./features/reports/reports.routes'),
  data: { preload: true }  // ✅ Marcar para pré-carregamento
}
```

---

## 6. Lazy Loading Avançado

### 6.1 Componentes Standalone

```typescript
// ✅ Carregar componente sob demanda
{
  path: 'profile',
  loadComponent: () => import('./features/profile/profile.component')
    .then(m => m.ProfileComponent)
}
```

### 6.2 Deferrable Views (Angular 17+)

```typescript
@Component({
  template: `
    <h1>Dashboard</h1>
    
    <!-- Carrega apenas quando visível na viewport -->
    @defer (on viewport) {
      <app-heavy-chart [data]="chartData" />
    } @placeholder {
      <div class="chart-placeholder">Carregando gráfico...</div>
    } @loading (minimum 500ms) {
      <mat-spinner />
    }
  `
})
export class DashboardComponent {}
```

---

## 7. Caching de Dados

### 7.1 HTTP Caching

```typescript
// core/interceptors/cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Apenas GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    const cached = this.cache.get(req.url);
    if (cached) {
      return of(cached.clone());
    }
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event);
        }
      })
    );
  }
}
```

### 7.2 Service Worker Caching

```json
// ngsw-config.json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-calls",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "1d"
      }
    }
  ]
}
```

---

## 8. Checklist de Performance

### Antes de cada release:

- [ ] Executar `ng build --configuration production`
- [ ] Verificar bundle size < 1 MB
- [ ] Testar Lighthouse score > 90
- [ ] Verificar Core Web Vitals
- [ ] Testar em dispositivo móvel (3G)
- [ ] Verificar lazy loading funcionando
- [ ] Confirmar service worker ativo

### Ferramentas de Análise:

```bash
# Build de produção
ng build --configuration production

# Lighthouse (Chrome DevTools)
# 1. Abrir DevTools
# 2. Ir para Lighthouse tab
# 3. Gerar relatório

# Web Vitals Extension
# Instalar extensão no Chrome

# PageSpeed Insights
# https://pagespeed.web.dev/
```

---

## 📈 Resultados Esperados

Após implementar todas as otimizações:

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Bundle Size | 1.25 MB | ~700 KB | -44% |
| FCP | ~2s | ~1s | -50% |
| LCP | ~3s | ~1.5s | -50% |
| TTI | ~3s | ~1.8s | -40% |
| Lighthouse | ~70 | >90 | +20 pts |

---

## 🎯 Prioridades

### 🔴 Alta (Implementar primeiro)
1. Remover MirageJS da produção
2. Otimizar Material imports
3. Implementar OnPush nos componentes principais

### 🟡 Média (Implementar em seguida)
4. Configurar preloading
5. Otimizar imagens
6. Implementar virtual scroll em listas grandes

### 🟢 Baixa (Quando necessário)
7. HTTP caching
8. SSR (Server-Side Rendering)
9. Advanced bundle splitting

---

*Documento baseado na análise do projeto CECOR - 2025-02-16*
