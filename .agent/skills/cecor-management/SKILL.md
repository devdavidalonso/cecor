---
name: cecor-management
description: Guia de gerenciamento de Alunos e Integração Keycloak no projeto CECOR
---

# CECOR Management Skill

Esta skill descreve os padrões e procedimentos para gerenciar alunos, professores e a integração com o Keycloak no projeto CECOR.

## 1. Arquitetura de Alunos

Os alunos são compostos por duas entidades principais no banco de dados:

- **Table `users`**: Contém dados básicos (nome, email, cpf, senha).
- **Table `students`**: Contém dados acadêmicos (matrícula, status, notas).
- **Table `addresses`**: Vinculada ao `user_id`, contém o endereço estruturado.

### Padrão de Endereço

Sempre use a tabela `addresses`. Não adicione campos de endereço diretamente na tabela `users` ou `students`.

## 2. Integração Keycloak

O sistema utiliza um Keycloak externo (`lar-sso`).

### Fluxo de Criação:

1. O backend cria o usuário localmente.

- **Keycloak**: O `KeycloakService` deve ser chamado pelos serviços de domínio (ex: `StudentService`). As senhas iniciais padrão são `aluno123` para alunos e `prof123` para professores. Trate falhas no Keycloak como alertas (`Warning`), não impedindo o salvamento no banco local (falha suave), a menos que seja um fluxo crítico de segurança.

- **KeycloakUserID**: Deve ser um ponteiro (`*string`) no Go para permitir valores `NULL` no banco caso a integração falhe, garantindo resiliência.
- **Ambiente**: As credenciais Admin (`KEYCLOAK_ADMIN_USERNAME`, etc.) devem estar presentes no `.env.docker`.

### 🔑 Senhas Iniciais:

- **Alunos**: `aluno123`
- **Professores**: `prof123`

- **Reiniciar serviços**: `make restart`
- **Verificar Logs**: `docker logs cecor-backend`
- **Testar Keycloak via Curl**:
  ```bash
  curl -d "client_id=admin-cli" -d "username=admin" -d "password=SENHA" -d "grant_type=password" https://lar-sso-keycloak.hrbsys.tech/realms/master/protocol/openid-connect/token
  ```

## 4. Padrões de Frontend (Angular)

- Use **Material Stepper** para formulários de cadastro.
- Use **FormArray** para gerenciar múltiplos responsáveis (Guardians).
- Datas devem ser enviadas no formato ISO (`YYYY-MM-DD`) para o backend.

### Campos de Data (Datepicker)

Sempre configure o campo de data para aceitar **entrada manual digitada + seleção via calendário**:

**1. Configuração do Provider (no componente):**
```typescript
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const BRAZILIAN_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: { dateInput: 'DD/MM/YYYY', monthYearLabel: 'MMM YYYY', ... }
};

@Component({
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: BRAZILIAN_DATE_FORMATS }
  ]
})
```

**2. HTML do campo:**
```html
<mat-form-field appearance="outline">
  <mat-label>Data de Nascimento</mat-label>
  <input
    matInput
    [matDatepicker]="picker"
    formControlName="birthDate"
    placeholder="Digite ou selecione..."
    (input)="formatDate($event)"
    maxlength="10"
    autocomplete="off"
  />
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
  <mat-hint>Digite DD/MM/AAAA ou use o calendário</mat-hint>
</mat-form-field>
```

**3. Método de formatação no TypeScript:**
```typescript
formatDate(event: any): void {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);
  
  // Aplica máscara visual
  let maskedValue = value;
  if (value.length >= 5) {
    maskedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
  } else if (value.length >= 3) {
    maskedValue = `${value.slice(0, 2)}/${value.slice(2)}`;
  }
  
  event.target.value = maskedValue;
  
  // Converte para Date quando completo
  if (value.length === 8) {
    const day = parseInt(value.slice(0, 2), 10);
    const month = parseInt(value.slice(2, 4), 10) - 1;
    const year = parseInt(value.slice(4), 10);
    const dateObj = new Date(year, month, day);
    
    if (dateObj.getDate() === day && dateObj.getMonth() === month) {
      this.form.get('birthDate')?.setValue(dateObj, { emitEvent: true });
    }
  }
}
```
