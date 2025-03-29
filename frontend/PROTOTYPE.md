# Guia de Implementação do Modo Protótipo no Sistema CECOR

Este guia explica como implementar e utilizar o modo de protótipo no sistema de gestão educacional CECOR. O modo de protótipo permite desenvolver e testar componentes da interface mesmo quando as APIs de backend ainda não estão prontas ou disponíveis.

## Sumário

1. [Conceito da "Opção B"](#conceito-da-opção-b)
2. [Arquitetura do Modo Protótipo](#arquitetura-do-modo-protótipo)
3. [Como Habilitar o Modo Protótipo](#como-habilitar-o-modo-protótipo)
4. [Criando Novos Componentes com Suporte ao Protótipo](#criando-novos-componentes-com-suporte-ao-protótipo)
5. [Criando Serviços Mockados](#criando-serviços-mockados)
6. [Uso do Angular Material em Protótipos](#uso-do-angular-material-em-protótipos)
7. [Melhores Práticas](#melhores-práticas)

## Conceito da "Opção B"

A "Opção B" refere-se à estratégia de incorporar o modo de protótipo diretamente nos componentes reais da aplicação. Isso significa que, em vez de criar componentes separados para protótipos, cada componente real tem a capacidade de funcionar em dois modos:

1. **Modo Real**: Conecta-se às APIs reais e exibe dados do backend
2. **Modo Protótipo**: Usa dados mockados e simula comportamentos de backend

Esta abordagem oferece várias vantagens:
- Evita duplicação de código
- Facilita a transição do protótipo para o produto final
- Permite testar componentes sem dependência do backend
- Proporciona um ambiente de demonstração para stakeholders

## Arquitetura do Modo Protótipo

A implementação do modo protótipo no CECOR consiste em:

1. **PrototypeService**: Serviço central que gerencia o estado do modo protótipo
2. **Mirage.js**: Biblioteca que simula uma API REST completa
3. **Serviços Mockados**: Versões simuladas dos serviços reais
4. **Factory Providers**: Fábricas que alternam entre serviços reais e mockados
5. **PrototypeHighlightDirective**: Diretiva visual para destacar elementos de protótipo
6. **PrototypeControlsComponent**: Interface para controlar o modo protótipo

## Como Habilitar o Modo Protótipo

Existem três maneiras de ativar o modo protótipo:

### 1. Via Configuração de Ambiente

Execute a aplicação com a configuração de protótipo:

```bash
npm run start:prototype
```

### 2. Via URL

Adicione o parâmetro `prototype=true` à URL:

```
http://localhost:4200?prototype=true
```

### 3. Via Interface de Usuário

Use o painel de controle de protótipo que aparece no canto inferior direito da tela quando o modo protótipo está ativado. Você pode alternar o modo clicando no botão flutuante e usando o toggle.

## Criando Novos Componentes com Suporte ao Protótipo

Para criar um novo componente que suporte o modo protótipo:

### 1. Importe os módulos necessários

```typescript
import { PrototypeService } from '../../core/services/prototype/prototype.service';
import { PrototypeHighlightDirective } from '../../shared/directives/prototype-highlight.directive';

@Component({
  // ...
  imports: [
    // ...
    PrototypeHighlightDirective
  ]
})
```

### 2. Inscreva-se no observable do modo protótipo

```typescript
export class MeuComponenteComponent implements OnInit {
  isPrototypeMode$: Observable<boolean>;
  
  constructor(private prototypeService: PrototypeService) {
    this.isPrototypeMode$ = this.prototypeService.prototypeEnabled$;
  }
}
```

### 3. Utilize o modo protótipo no template

```html
<!-- Indicador de modo protótipo -->
<div *ngIf="isPrototypeMode$ | async" class="prototype-indicator" appPrototypeHighlight>
  <mat-icon>build</mat-icon> 
  Modo Protótipo - Dados Simulados
</div>

<!-- Renderização condicional baseada no modo -->
<ng-container *ngIf="isPrototypeMode$ | async; else realContent">
  <!-- Conteúdo do modo protótipo -->
  <div class="prototype-data">
    <!-- Dados mockados -->
  </div>
</ng-container>

<ng-template #realContent>
  <!-- Conteúdo do modo real -->
  <div *ngIf="loading">Carregando...</div>
  <div *ngIf="error">{{ error }}</div>
  <div *ngIf="data"><!-- Dados reais --></div>
</ng-template>
```

### 4. Carregue dados com base no modo

```typescript
ngOnInit() {
  // Verificar se está no modo protótipo
  this.prototypeService.prototypeEnabled$.pipe(
    tap(isPrototype => {
      if (isPrototype) {
        // Carregar dados mockados
        this.data = this.mockData;
      } else {
        // Carregar dados reais
        this.loadRealData();
      }
    })
  ).subscribe();
}
```

## Criando Serviços Mockados

Para criar um serviço mockado:

### 1. Crie o serviço mockado que implementa a mesma interface que o serviço real

```typescript
// src/app/core/services/prototype/mock-exemplo.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class MockExemploService {
  // Dados mockados
  private dadosMock = [
    { id: 1, nome: 'Exemplo 1' },
    { id: 2, nome: 'Exemplo 2' }
  ];
  
  // Métodos com mesma assinatura do serviço real
  getDados(): Observable<any[]> {
    return of(this.dadosMock).pipe(delay(800));
  }
  
  getDadoPorId(id: number): Observable<any> {
    const dado = this.dadosMock.find(d => d.id === id);
    return of(dado).pipe(delay(800));
  }
  
  // Outros métodos...
}
```

### 2. Crie uma factory para alternar entre os serviços real e mockado

```typescript
// src/app/core/factories/exemplo-service.factory.ts
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ExemploService } from '../services/exemplo.service';
import { MockExemploService } from '../services/prototype/mock-exemplo.service';
import { PrototypeService } from '../services/prototype/prototype.service';

export function exemploServiceFactory() {
  const http = inject(HttpClient);
  const prototypeService = inject(PrototypeService);
  
  if (prototypeService.isPrototypeEnabled()) {
    return new MockExemploService();
  }
  
  return new ExemploService(http);
}
```

### 3. Configure o provider no app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    {
      provide: ExemploService,
      useFactory: exemploServiceFactory
    }
  ]
};
```

## Uso do Angular Material em Protótipos

O Angular Material funciona perfeitamente com o modo de protótipo, permitindo criar interfaces realistas mesmo sem dados reais. Para utilizá-lo:

### 1. Importe os módulos necessários

```typescript
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// Outros módulos conforme necessário

@Component({
  // ...
  imports: [
    // ...
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
```

### 2. Use componentes do Material no seu template

```html
<mat-card *ngFor="let item of (isPrototypeMode$ | async) ? mockItems : items">
  <mat-card-header>
    <mat-card-title>{{ item.title }}</mat-card-title>
    <mat-card-subtitle>{{ item.subtitle }}</mat-card-subtitle>
  </mat-card-header>
  
  <mat-card-content>
    {{ item.content }}
  </mat-card-content>
  
  <mat-card-actions>
    <button mat-button>DETALHES</button>
    <button mat-raised-button color="primary">AÇÃO</button>
  </mat-card-actions>
</mat-card>
```

### 3. Aproveite os formulários do Material

O Angular Material oferece excelentes componentes para formulários que são perfeitos para protótipos:

```html
<form [formGroup]="formGroup">
  <mat-form-field appearance="outline">
    <mat-label>Nome</mat-label>
    <input matInput formControlName="nome">
    <mat-error *ngIf="formGroup.get('nome')?.invalid">Nome é obrigatório</mat-error>
  </mat-form-field>
  
  <mat-form-field appearance="outline">
    <mat-label>Categoria</mat-label>
    <mat-select formControlName="categoria">
      <mat-option *ngFor="let categoria of categorias" [value]="categoria.valor">
        {{ categoria.nome }}
      </mat-option>
    </mat-select>
  </mat-form-field>
  
  <button mat-raised-button color="primary" [disabled]="formGroup.invalid">
    Salvar
  </button>
</form>
```

## Melhores Práticas

1. **Separação clara**: Use comentários e a diretiva `appPrototypeHighlight` para distinguir claramente elementos exclusivos do protótipo.

2. **Dados realistas**: Crie dados mockados que representem situações reais, incluindo casos de erro e estados de borda.

3. **Simulação de latência**: Use o operador `delay()` para simular tempos de resposta realistas da API.

4. **Estados de UI**: Garanta que seu protótipo demonstre todos os estados importantes:
   - Carregamento
   - Sucesso
   - Erro
   - Vazio (sem dados)

5. **Consistência**: Mantenha uma experiência consistente entre os modos real e protótipo.

6. **Documentação**: Documente os comportamentos específicos do protótipo para facilitar o entendimento pela equipe.

7. **Feedback visual**: Use o componente de controle de protótipo para fornecer feedback claro sobre o estado atual do sistema.

8. **Dados persistentes**: Para experiências mais realistas, considere implementar persistência local (localStorage) no modo protótipo.

9. **Testes**: Teste ambos os modos (real e protótipo) para garantir que funcionem corretamente.

10. **Gradualidade**: Migre gradualmente do modo protótipo para o modo real à medida que as APIs se tornam disponíveis.