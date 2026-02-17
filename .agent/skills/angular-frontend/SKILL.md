---
name: angular-frontend
description: Padrões técnicos e de UI para o Frontend (Angular 17+) no projeto CECOR
---

# Angular Frontend Skill - CECOR

Este guia define os padrões de interface e desenvolvimento para o frontend usando Angular e Material Design.

---

## 🌍 Convenção de Nomenclatura (IMPORTANTE)

### Código (TypeScript) - 100% Inglês

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classes | PascalCase + Inglês | `CourseService`, `StudentFormComponent` |
| Interfaces | PascalCase + Inglês | `Course`, `Teacher`, `Student` |
| Propriedades | camelCase + Inglês | `course.name`, `student.email` |
| Métodos | camelCase + Inglês | `getCourses()`, `createStudent()` |
| Variáveis | camelCase + Inglês | `courseList`, `isLoading` |

### Arquivos - Nomes em Inglês

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Pastas | kebab-case | `features/students/`, `core/services/` |
| Componentes | `*.component.ts` | `student-form.component.ts` |
| Serviços | `*.service.ts` | `course.service.ts` |
| Models | `*.model.ts` | `course.model.ts` |
| Pipes | `*.pipe.ts` | `cpf-format.pipe.ts` |

### Labels/UI - Via i18n (ngx-translate)

**⚠️ NUNCA hardcode textos em português nos templates!**

```html
<!-- ✅ CORRETO - Usar i18n -->
<h1>{{ 'COURSE.TITLE' | translate }}</h1>
<button>{{ 'COMMON.SAVE' | translate }}</button>
<p>{{ 'STUDENT.NAME' | translate }}</p>

<!-- ❌ INCORRETO - Hardcoded -->
<h1>Cadastro de Cursos</h1>
<button>Salvar</button>
<p>Nome</p>
```

### Estrutura das Chaves de Tradução

```json
{
  "NAV": {
    "HOME": "Início",
    "STUDENTS": "Alunos",
    "TEACHERS": "Professores",
    "COURSES": "Cursos"
  },
  "COMMON": {
    "SAVE": "Salvar",
    "CANCEL": "Cancelar",
    "DELETE": "Excluir"
  },
  "STUDENT": {
    "TITLE": "Alunos",
    "NAME": "Nome",
    "EMAIL": "E-mail"
  }
}
```

**Uso:**
```html
<!-- Navegação -->
{{ 'NAV.STUDENTS' | translate }}

<!-- Comuns -->
{{ 'COMMON.SAVE' | translate }}

<!-- Domínio específico -->
{{ 'STUDENT.NAME' | translate }}

<!-- Com parâmetros -->
{{ 'ERRORS.MIN_LENGTH' | translate:{count: 3} }}
```

---

## 1. Design System (Material Design)

- **Componentes**: Utilize sempre @angular/material para botões, tabelas, inputs e diálogos.
- **Consistência**: Mantenha o padrão de cores e espaçamento definido no tema global.
- **Tabelas**: Use `mat-table` com `MatSort` e `MatPaginator` para listagens complexas.

---

## 2. Formulários (Reactive Forms)

- **Estratégia**: Use `FormGroup` e `FormBuilder`.
- **Complexidade**: Para formulários longos (como cadastro de aluno), utilize o `mat-stepper` para dividir em etapas lógicas.
- **Dinamicidade**: Use `FormArray` para listas dinâmicas (ex: responsáveis, contatos adicionais).
- **Validação**: Implemente validadores personalizados para CPF, CEP e telefones.

---

## 3. Serviços e APIs

- **Modelos**: Mantenha as interfaces TypeScript sincronizadas com as structs do Go no backend (localizadas em `frontend/src/app/core/models`).
- **Data Formatting**: Datas devem ser formatadas como ISO (`YYYY-MM-DD`) no momento do envio para a API.
- **Locale**: O projeto está configurado para `pt-BR`. Utilize o seletor de data e pipes de moeda de acordo com este locale.

### Exemplo de Serviço

```typescript
// ✅ CORRETO - Tudo em inglês
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  name: string;
  shortDescription?: string;
  workload: number;
  maxStudents: number;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }
}
```

---

## 4. UX e Feedback

- **Loading**: Exiba estados de carregamento ou spinners durante chamadas assíncronas.
- **Snackbars**: Use `MatSnackBar` para confirmar sucessos ou exibir mensagens de erro vindas do backend.

### Snackbar com i18n

```typescript
import { TranslationService } from '../services/translation.service';

export class StudentFormComponent {
  constructor(
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {}

  saveStudent() {
    this.studentService.create(student).subscribe({
      next: () => {
        const message = this.translationService.get('STUDENT.SUCCESS_CREATED');
        this.snackBar.open(message, this.translationService.get('COMMON.CLOSE'));
      },
      error: () => {
        const message = this.translationService.get('STUDENT.ERROR_CREATE');
        this.snackBar.open(message, this.translationService.get('COMMON.CLOSE'));
      }
    });
  }
}
```

---

## 5. Criando Novos Componentes

### Checklist

Ao criar um novo componente, verifique:

- [ ] **Nome da classe** em inglês (PascalCase): `TeacherFormComponent`
- [ ] **Nome do arquivo** em inglês (kebab-case): `teacher-form.component.ts`
- [ ] **Propriedades** em inglês (camelCase): `teacher.name`, `course.workload`
- [ ] **Métodos** em inglês (camelCase): `getTeachers()`, `saveCourse()`
- [ ] **Labels no template** via i18n: `{{ 'TEACHER.NAME' | translate }}`
- [ ] **Chaves de tradução** adicionadas em `assets/i18n/pt-BR.json`

### Exemplo Completo

```typescript
// teacher-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule],
  template: `
    <h2>{{ 'TEACHER.TITLE' | translate }}</h2>
    <button mat-raised-button color="primary">
      {{ 'COMMON.SAVE' | translate }}
    </button>
  `
})
export class TeacherFormComponent {}
```

```json
// assets/i18n/pt-BR.json
{
  "TEACHER": {
    "TITLE": "Cadastro de Professor",
    "NAME": "Nome",
    "EMAIL": "E-mail"
  }
}
```

---

## 📊 Performance

Veja o guia completo de performance:
- [Performance Guide](./PERFORMANCE.md) - Otimização de bundle, lazy loading, OnPush

### Resumo de Performance do Projeto

```
Bundle Atual:    1.25 MB (⚠️ Meta: < 800 KB)
Lazy Loading:    100% ✅
Standalone:      Sim ✅
PWA:             Configurado ✅
```

### Melhorias Prioritárias

1. **Remover MirageJS da produção**
2. **Otimizar imports do Material**
3. **Implementar OnPush change detection**
4. **Virtual scroll para listas grandes**

---

## 📚 Referências

- [Documentação de Migração](../../FRONTEND_MIGRATION_PLAN.md)
- [Análise de Arquitetura](../../../docs/FRONTEND_ARCHITECTURE_REVIEW.md)
- [Performance Guide](./PERFORMANCE.md)
- [ngx-translate](https://github.com/ngx-translate/core)
- [Angular Style Guide](https://angular.io/guide/styleguide)
