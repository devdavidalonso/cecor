# 🌍 Plano de Migração Frontend: PT → EN + i18n

## 📋 Resumo Executivo

**Objetivo**: 
1. Renomear todos os componentes, pastas e métodos do frontend de português para inglês
2. Implementar sistema de internacionalização (i18n) com `@ngx-translate`
3. Manter as labels da interface em português via arquivos de tradução

**Escopo**: `/frontend/src/app/`

**Status**: ✅ **CONCLUÍDO** (2025-02-16)

---

## ✅ Mapeamento de Renomeação - IMPLEMENTADO

### Features (PT → EN)

| Pasta Original (PT) | Nova Pasta (EN) | Status |
|---------------------|-----------------|--------|
| `features/administracao/` | `features/administration/` | ✅ Concluído |
| `features/alunos/` | `features/students/` | ✅ Consolidado |
| `features/cursos/` | `features/courses/` | ✅ Consolidado |
| `features/entrevistas/` | `features/interviews/` | ✅ Concluído |
| `features/matriculas/` | `features/enrollments/` | ✅ Consolidado |
| `features/perfil/` | `features/profile/` | ✅ Concluído |
| `features/presencas/` | `features/attendance/` | ✅ Consolidado |
| `features/relatorios/` | `features/reports/` | ✅ Consolidado |
| `features/voluntariado/` | `features/volunteering/` | ✅ Concluído |

### Services (PT → EN)

| Arquivo Original | Novo Arquivo | Status |
|------------------|--------------|--------|
| `aluno.service.ts` | `student.service.ts` | ✅ Renomeado |
| `curso.service.ts` | `course.service.ts` | ✅ Renomeado |
| `professor.service.ts` | `teacher.service.ts` | ✅ Renomeado |

### Models (PT → EN)

| Arquivo Original | Novo Arquivo | Status |
|------------------|--------------|--------|
| `curso.model.ts` | `course.model.ts` | ✅ Consolidado |
| `aluno.model.ts` | `student.model.ts` | ✅ Consolidado |

### Mock Data (PT → EN)

| Arquivo Original | Novo Arquivo | Status |
|------------------|--------------|--------|
| `mock-cursos.ts` | `mock-courses.ts` | ✅ Renomeado |

---

## 📅 Fases da Migração - STATUS

### ✅ FASE 1: Setup i18n (CONCLUÍDO)

#### 1.1 Instalar dependências
```bash
cd frontend
npm install @ngx-translate/core @ngx-translate/http-loader --save
```
✅ **Status**: Instalado v20.0.0

#### 1.2 Configurar TranslateModule
- ✅ Criado `TranslationService` wrapper
- ✅ Configurado no `app.config.ts` com `provideTranslateService`
- ✅ Configurado `TranslateHttpLoader`

#### 1.3 Criar estrutura de arquivos de tradução
```
assets/
└── i18n/
    └── pt-BR.json          (Português - padrão) ✅
```

---

### ✅ FASE 2: Criar Arquivos de Tradução (CONCLUÍDO)

#### 2.1 Extrair labels do sistema
✅ Labels organizadas em:
- `NAV` - Navegação
- `COMMON` - Textos comuns
- `HOME` - Página inicial
- `COURSE` - Cursos
- `STUDENT` - Alunos
- `TEACHER` - Professores
- `ENROLLMENT` - Matrículas

#### 2.2 Exemplo do arquivo pt-BR.json
```json
{
  "NAV": {
    "HOME": "Início",
    "STUDENTS": "Alunos",
    "TEACHERS": "Professores",
    "COURSES": "Cursos",
    "ENROLLMENTS": "Matrículas",
    "ATTENDANCE": "Presenças",
    "REPORTS": "Relatórios",
    "ADMINISTRATION": "Administração",
    "PROFILE": "Perfil",
    "LOGOUT": "Sair"
  },
  "COMMON": {
    "LOADING": "Carregando...",
    "SAVE": "Salvar",
    "CANCEL": "Cancelar",
    "CONFIRM": "Confirmar",
    "DELETE": "Excluir",
    "EDIT": "Editar",
    "VIEW": "Visualizar",
    "BACK": "Voltar",
    "SEARCH": "Pesquisar",
    "ACTIONS": "Ações"
  }
}
```
✅ **Status**: Arquivo criado com 100+ chaves

---

### ✅ FASE 3: Renomear Pastas e Componentes (CONCLUÍDO)

#### 3.1 Renomear pastas (ordem importante)
```bash
# ✅ Completado
git mv features/administracao features/administration
git mv features/entrevistas features/interviews
git mv features/perfil features/profile
git mv features/voluntariado features/volunteering

# ✅ Duplicatas consolidadas
# alunos/ → students/
# cursos/ → courses/
# matriculas/ → enrollments/
# presencas/ → attendance/
# relatorios/ → reports/
```

#### 3.2 Atualizar imports
✅ Atualizados em:
- `app.routes.ts`
- `app.config.ts`
- Services
- Componentes

---

### ✅ FASE 4: Atualizar Templates com i18n (CONCLUÍDO)

#### 4.1 Padrão de labels hardcoded
```html
<!-- ✅ IMPLEMENTADO -->
<h1>{{ 'STUDENT.TITLE' | translate }}</h1>
<button>{{ 'COMMON.SAVE' | translate }}</button>
```

#### 4.2 Componentes
```typescript
// ✅ IMPLEMENTADO
import { TranslationService } from '../../core/services/translation.service';

@Component({...})
export class StudentFormComponent {
  constructor(private translationService: TranslationService) {}
  
  saveStudent() {
    const message = this.translationService.get('STUDENT.SUCCESS_CREATED');
    // ...
  }
}
```

---

### ✅ FASE 5: Testes e Validação (CONCLUÍDO)

#### 5.1 Build
```bash
npm run build
```
✅ **Status**: Build sem erros TypeScript

#### 5.2 Verificações
- ✅ Todos os imports atualizados
- ✅ Mock server funcionando com `/courses`
- ✅ Home component corrigido

---

## 🔧 Configuração do i18n Implementada

### app.config.ts
```typescript
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    // i18n Configuration
    provideTranslateService({
      defaultLanguage: 'pt-BR',
      useDefaultLang: true
    }),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ]
};
```

### TranslationService (Wrapper)
```typescript
@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private translate: TranslateService) {}

  get(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  getAsync(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
  }
}
```

### Uso nos Templates
```html
<!-- Labels via pipe -->
<h1>{{ 'NAV.HOME' | translate }}</h1>

<!-- Com parâmetros -->
<p>{{ 'ERRORS.MIN_LENGTH' | translate:{count: 3} }}</p>

<!-- Placeholders -->
<input [placeholder]="'STUDENT.NAME_PLACEHOLDER' | translate">
```

---

## ⚠️ Convenções Estabelecidas

### 1. Código (TypeScript)
- ✅ **Classes**: PascalCase em inglês (`CourseService`, `StudentFormComponent`)
- ✅ **Variáveis/Propriedades**: camelCase em inglês (`course.name`, `student.email`)
- ✅ **Métodos**: camelCase em inglês (`getCourses()`, `createStudent()`)
- ✅ **Interfaces**: PascalCase em inglês (`Course`, `Teacher`, `Student`)

### 2. Arquivos
- ✅ **Pastas**: kebab-case em inglês (`features/students/`, `core/services/`)
- ✅ **Serviços**: `*.service.ts` (`course.service.ts`)
- ✅ **Componentes**: `*.component.ts` (`student-form.component.ts`)
- ✅ **Models**: `*.model.ts` (`course.model.ts`)

### 3. UI/Labels (via i18n)
- ✅ **Navegação**: `NAV.*` (`NAV.STUDENTS`, `NAV.COURSES`)
- ✅ **Comum**: `COMMON.*` (`COMMON.SAVE`, `COMMON.CANCEL`)
- ✅ **Domínio**: `[DOMINIO].*` (`STUDENT.NAME`, `COURSE.WORKLOAD`)

### 4. Rotas
- ✅ **Caminhos**: inglês (`/students`, `/courses`, `/enrollments`)

---

## 📝 Checklist Final

### Preparação
- [x] Criar branch `refactor/frontend-i18n`
- [x] Instalar @ngx-translate v20.0.0
- [x] Configurar TranslateModule

### Traduções
- [x] Criar arquivo `assets/i18n/pt-BR.json`
- [x] Extrair labels do sistema
- [x] Organizar por contexto

### Renomeação
- [x] Renomear `administracao/` → `administration/`
- [x] Renomear `entrevistas/` → `interviews/`
- [x] Renomear `perfil/` → `profile/`
- [x] Renomear `voluntariado/` → `volunteering/`
- [x] Consolidar duplicatas
- [x] Atualizar todos os imports
- [x] Renomear serviços (`curso.service.ts` → `course.service.ts`)

### Templates
- [x] Atualizar home component
- [x] Mock server para `/courses`
- [x] Interfaces em inglês

### Testes
- [x] Build sem erros
- [x] Navegação funcionando

---

## 🎯 Padrões para Novos Componentes

Ao criar novos componentes, **SEMPRE** siga:

### 1. Nomenclatura
```typescript
// ✅ CORRETO
export class TeacherFormComponent { }
export class EnrollmentListComponent { }

// ❌ INCORRETO
export class ProfessorFormComponent { }  // Português
export class MatriculaListComponent { }  // Português
```

### 2. Propriedades
```typescript
// ✅ CORRETO
interface Course {
  name: string;
  workload: number;
  maxStudents: number;
}

// ❌ INCORRETO
interface Curso {
  nome: string;           // Português
  cargaHoraria: number;   // Português
  numeroMaximoAlunos: number;  // Português
}
```

### 3. Labels na UI
```html
<!-- ✅ CORRETO - Usar i18n -->
<h1>{{ 'COURSE.TITLE' | translate }}</h1>
<button>{{ 'COMMON.SAVE' | translate }}</button>

<!-- ❌ INCORRETO - Hardcoded em português -->
<h1>Cadastro de Cursos</h1>
<button>Salvar</button>
```

### 4. Serviços
```typescript
// ✅ CORRETO
@Injectable({ providedIn: 'root' })
export class TeacherService {
  getTeachers(): Observable<Teacher[]> { }
}

// ❌ INCORRETO
@Injectable({ providedIn: 'root' })
export class ProfessorService {
  getProfessores(): Observable<Professor[]> { }  // Português
}
```

---

## 🚀 Estimativa vs Real

| Fase | Estimado | Real | Status |
|------|----------|------|--------|
| 1. Setup i18n | 1 dia | 2 horas | ✅ |
| 2. Arquivos de tradução | 2 dias | 4 horas | ✅ |
| 3. Renomear pastas/componentes | 2-3 dias | 6 horas | ✅ |
| 4. Atualizar templates | 2 dias | 4 horas | ✅ |
| 5. Testes e validação | 1-2 dias | 2 horas | ✅ |
| **TOTAL** | **8-10 dias** | **~18 horas** | ✅ |

---

## 📚 Referências

- [ngx-translate Documentation](https://github.com/ngx-translate/core)
- [Angular i18n Guide](https://angular.io/guide/i18n-overview)
- [CECOR Backend Migration](../MIGRATION_PHASE1_REPORT.md)

---

**Status**: ✅ **MIGRAÇÃO CONCLUÍDA**

*Última atualização: 2025-02-16*
