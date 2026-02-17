---
name: cecor-management
description: Guia de gerenciamento de Alunos e Integração Keycloak no projeto CECOR
---

# CECOR Management Skill

Esta skill descreve os padrões e procedimentos para gerenciar alunos, professores e a integração com o Keycloak no projeto CECOR.

---

## 🌍 Convenção de Nomenclatura (IMPORTANTE)

Antes de qualquer implementação, lembre-se:

### Backend (Go)
- **Packages**: `service/students/`, `service/teachers/` (inglês)
- **Structs**: `Student`, `Teacher`, `Course` (inglês)
- **APIs**: `/api/students`, `/api/teachers` (inglês)

### Frontend (Angular)
- **Componentes**: `StudentFormComponent`, `TeacherListComponent` (inglês)
- **Serviços**: `student.service.ts`, `teacher.service.ts` (inglês)
- **Propriedades**: `student.name`, `course.workload` (inglês)
- **Labels**: `{{ 'STUDENT.NAME' | translate }}` (i18n)

**⚠️ NUNCA use português em código! Labels da UI devem usar o sistema i18n.**

---

## 1. Arquitetura de Alunos

Os alunos são compostos por duas entidades principais no banco de dados:

- **Table `users`**: Contém dados básicos (nome, email, cpf, senha).
- **Table `students`**: Contém dados acadêmicos (matrícula, status, notas).
- **Table `addresses`**: Vinculada ao `user_id`, contém o endereço estruturado.

### Padrão de Endereço

Sempre use a tabela `addresses`. Não adicione campos de endereço diretamente na tabela `users` ou `students`.

---

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

---

## 4. Padrões de Frontend (Angular)

- Use **Material Stepper** para formulários de cadastro.
- Use **FormArray** para gerenciar múltiplos responsáveis (Guardians).
- Datas devem ser enviadas no formato ISO (`YYYY-MM-DD`) para o backend.

### Convenções de Nomenclatura

```typescript
// ✅ CORRETO - Inglês + i18n
@Component({
  selector: 'app-student-form',
  template: `
    <h1>{{ 'STUDENT.TITLE' | translate }}</h1>
    <mat-form-field>
      <mat-label>{{ 'STUDENT.NAME' | translate }}</mat-label>
      <input matInput formControlName="name">
    </mat-form-field>
    <button mat-raised-button color="primary">
      {{ 'COMMON.SAVE' | translate }}
    </button>
  `
})
export class StudentFormComponent {
  student: Student = { name: '', email: '' };
}

// ❌ INCORRETO - Português hardcoded
@Component({
  template: `
    <h1>Cadastro de Aluno</h1>
    <mat-form-field>
      <mat-label>Nome</mat-label>
      <input matInput formControlName="nome">
    </mat-form-field>
    <button>Salvar</button>
  `
})
export class AlunoFormComponent {  // Português
  aluno: Aluno = { nome: '' };     // Português
}
```

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
  <mat-label>{{ 'STUDENT.BIRTH_DATE' | translate }}</mat-label>
  <input
    matInput
    [matDatepicker]="picker"
    formControlName="birthDate"
    [placeholder]="'STUDENT.BIRTH_DATE_PLACEHOLDER' | translate"
    (input)="formatDate($event)"
    maxlength="10"
    autocomplete="off"
  />
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
  <mat-hint>{{ 'COMMON.DATE_HINT' | translate }}</mat-hint>
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

---

## 5. Criando Novos Cadastros

### Checklist para Novas Entidades

Ao criar um novo cadastro (ex: `Teacher`, `Course`), verifique:

#### Backend
- [ ] **Model** em inglês: `internal/models/teacher.go`
- [ ] **Service** em inglês: `internal/service/teachers/`
- [ ] **Handler** com rotas em inglês: `/api/teachers`
- [ ] **Migration** com nomes em inglês: `CREATE TABLE teachers`
- [ ] **Keycloak integration** (se aplicável)

#### Frontend
- [ ] **Componente** em inglês: `TeacherFormComponent`
- [ ] **Serviço** em inglês: `teacher.service.ts`
- [ ] **Interface** em inglês: `Teacher { name: string }`
- [ ] **Labels** via i18n: `{{ 'TEACHER.NAME' | translate }}`
- [ ] **Chaves de tradução** em `assets/i18n/pt-BR.json`

### Exemplo: Cadastro de Professor

```typescript
// ✅ FRONTEND - teacher-form.component.ts
import { Component } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-teacher-form',
  template: `
    <h1>{{ 'TEACHER.TITLE' | translate }}</h1>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-form-field>
        <mat-label>{{ 'TEACHER.NAME' | translate }}</mat-label>
        <input matInput formControlName="name">
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">
        {{ 'COMMON.SAVE' | translate }}
      </button>
    </form>
  `
})
export class TeacherFormComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private translationService: TranslationService,
    private snackBar: MatSnackBar
  ) {}

  save() {
    if (this.form.valid) {
      this.teacherService.create(this.form.value).subscribe({
        next: () => {
          const message = this.translationService.get('TEACHER.SUCCESS_CREATED');
          this.snackBar.open(message, this.translationService.get('COMMON.CLOSE'));
        }
      });
    }
  }
}
```

```json
// ✅ assets/i18n/pt-BR.json
{
  "TEACHER": {
    "TITLE": "Cadastro de Professor",
    "NAME": "Nome",
    "EMAIL": "E-mail",
    "SUCCESS_CREATED": "Professor cadastrado com sucesso!"
  }
}
```

```go
// ✅ BACKEND - internal/models/teacher.go
package models

type Teacher struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:255;not null" json:"name"`
    Email     string    `gorm:"size:255;unique;not null" json:"email"`
    CPF       string    `gorm:"size:14;unique" json:"cpf,omitempty"`
    Phone     *string   `gorm:"size:20" json:"phone,omitempty"`
    CreatedAt time.Time `json:"created_at"`
}
```

---

## 📚 Referências

- [Angular Frontend Skill](../angular-frontend/SKILL.md)
- [Go Backend Skill](../go-backend/SKILL.md)
- [Documentação de Migração](../../../MIGRATION_PHASE1_REPORT.md)
