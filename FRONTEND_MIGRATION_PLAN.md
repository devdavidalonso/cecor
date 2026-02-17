# 🌍 Plano de Migração Frontend: PT → EN + i18n

## 📋 Resumo Executivo

**Objetivo**: 
1. Renomear todos os componentes, pastas e métodos do frontend de português para inglês
2. Implementar sistema de internacionalização (i18n) com `@ngx-translate`
3. Manter as labels da interface em português via arquivos de tradução

**Escopo**: `/frontend/src/app/`

---

## 📁 Mapeamento de Renomeação de Pastas

### Features (PT → EN)

| Pasta Atual (PT) | Novo Nome (EN) | Descrição |
|------------------|----------------|-----------|
| `features/administracao/` | `features/administration/` | Administração |
| `features/alunos/` | `features/students/` | Alunos (já existe, consolidar) |
| `features/cursos/` | `features/courses/` | Cursos (já existe, consolidar) |
| `features/entrevistas/` | `features/interviews/` | Entrevistas |
| `features/matriculas/` | `features/enrollments/` | Matrículas (já existe, consolidar) |
| `features/perfil/` | `features/profile/` | Perfil do usuário |
| `features/presencas/` | `features/attendance/` | Presenças (já existe, consolidar) |
| `features/relatorios/` | `features/reports/` | Relatórios (já existe, consolidar) |
| `features/voluntariado/` | `features/volunteering/` | Voluntariado |

### Services (PT → EN)

| Arquivo Atual | Novo Nome |
|---------------|-----------|
| `aluno.service.ts` | `student.service.ts` (consolidar) |
| `curso.service.ts` | `course.service.ts` (consolidar) |
| `professor.service.ts` | `teacher.service.ts` |

### Models (PT → EN)

| Arquivo Atual | Novo Nome |
|---------------|-----------|
| `curso.model.ts` | `course.model.ts` (consolidar) |

---

## 🗓️ Fases da Migração

### FASE 1: Setup i18n (1 dia)

#### 1.1 Instalar dependências
```bash
cd frontend
npm install @ngx-translate/core @ngx-translate/http-loader --save
```

#### 1.2 Configurar TranslateModule
- Criar `src/app/core/config/translate.config.ts`
- Configurar no `app.config.ts`

#### 1.3 Criar estrutura de arquivos de tradução
```
assets/
└── i18n/
    ├── pt-BR.json          (Português - padrão)
    └── en-US.json          (Inglês - futuro)
```

### FASE 2: Criar Arquivos de Tradução (2 dias)

#### 2.1 Extrair todas as labels do sistema
Labels em:
- HTML templates (`{{ 'LABEL' | translate }}`)
- Componentes TypeScript
- Mensagens de erro/validação
- Títulos de páginas
- Botões
- Menu/navegação

#### 2.2 Estrutura do arquivo pt-BR.json
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
  "STUDENT": {
    "TITLE": "Alunos",
    "NEW": "Novo Aluno",
    "EDIT": "Editar Aluno",
    "DETAILS": "Detalhes do Aluno",
    "NAME": "Nome",
    "EMAIL": "E-mail",
    "CPF": "CPF",
    "BIRTH_DATE": "Data de Nascimento",
    "PHONE": "Telefone",
    "STATUS": "Status",
    "REGISTRATION_NUMBER": "Matrícula",
    "GUARDIAN": "Responsável",
    "SAVE": "Salvar",
    "CANCEL": "Cancelar",
    "DELETE": "Excluir",
    "SEARCH": "Pesquisar",
    "ACTIVE": "Ativo",
    "INACTIVE": "Inativo",
    "SUSPENDED": "Suspenso"
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
    "NEXT": "Próximo",
    "PREVIOUS": "Anterior",
    "SEARCH": "Pesquisar",
    "FILTER": "Filtrar",
    "ACTIONS": "Ações",
    "YES": "Sim",
    "NO": "Não",
    "SUCCESS": "Sucesso",
    "ERROR": "Erro",
    "WARNING": "Aviso",
    "INFO": "Informação"
  },
  "ERRORS": {
    "REQUIRED": "Campo obrigatório",
    "INVALID_EMAIL": "E-mail inválido",
    "INVALID_CPF": "CPF inválido",
    "MIN_LENGTH": "Mínimo de {{count}} caracteres",
    "MAX_LENGTH": "Máximo de {{count}} caracteres"
  }
}
```

### FASE 3: Renomear Pastas e Componentes (2-3 dias)

#### 3.1 Renomear pastas (ordem importante)
```bash
# 1. administration (administracao)
git mv features/administracao features/administration

# 2. interviews (entrevistas)
git mv features/entrevistas features/interviews

# 3. profile (perfil)
git mv features/perfil features/profile

# 4. volunteering (voluntariado)
git mv features/voluntariado features/volunteering

# 5. Consolidar duplicatas
# - alunos/ → students/ (merge)
# - cursos/ → courses/ (merge)
# - matriculas/ → enrollments/ (merge)
# - presencas/ → attendance/ (merge)
# - relatorios/ → reports/ (merge)
```

#### 3.2 Atualizar imports em todos os arquivos
- `app.routes.ts`
- Arquivos de rotas
- Services
- Componentes

### FASE 4: Atualizar Templates com i18n (2 dias)

#### 4.1 Substituir labels hardcoded
```html
<!-- ANTES -->
<h1>Cadastro de Alunos</h1>
<button>Salvar</button>

<!-- DEPOIS -->
<h1>{{ 'STUDENT.TITLE' | translate }}</h1>
<button>{{ 'COMMON.SAVE' | translate }}</button>
```

#### 4.2 Atualizar componentes
```typescript
// ANTES
this.snackBar.open('Aluno cadastrado com sucesso!', 'Fechar');

// DEPOIS
this.snackBar.open(
  this.translate.instant('STUDENT.SUCCESS_CREATED'), 
  this.translate.instant('COMMON.CLOSE')
);
```

### FASE 5: Testes e Validação (1-2 dias)

#### 5.1 Verificar build
```bash
npm run build
```

#### 5.2 Verificar traduções
- Verificar se todas as labels estão traduzidas
- Verificar interpolação de variáveis
- Testar mudança de idioma (se aplicável)

---

## 🔧 Implementação do i18n

### Configuração do TranslateModule

```typescript
// app.config.ts
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideTranslateService({
      defaultLanguage: 'pt-BR',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
};
```

### Uso nos Componentes

```typescript
// Componente
import { TranslateService } from '@ngx-translate/core';

@Component({...})
export class StudentFormComponent {
  constructor(private translate: TranslateService) {}
  
  saveStudent() {
    const message = this.translate.instant('STUDENT.SUCCESS_CREATED');
    // ...
  }
}
```

```html
<!-- Template -->
<label>{{ 'STUDENT.NAME' | translate }}</label>
<input [placeholder]="'STUDENT.NAME_PLACEHOLDER' | translate">

<!-- Com interpolação -->
<p>{{ 'ERRORS.MIN_LENGTH' | translate:{count: 3} }}</p>
```

---

## ⚠️ Considerações Importantes

### 1. Duplicatas (Merge necessário)
- `alunos/` e `students/` → manter `students/`
- `cursos/` e `courses/` → manter `courses/`
- `matriculas/` e `enrollments/` → manter `enrollments/`
- `presencas/` e `attendance/` → manter `attendance/`
- `relatorios/` e `reports/` → manter `reports/`

### 2. Rotas
Atualizar `app.routes.ts` e arquivos de rotas:
```typescript
// ANTES
path: 'alunos', loadChildren: () => import('./features/alunos/alunos.routes')

// DEPOIS
path: 'students', loadChildren: () => import('./features/students/students.routes')
```

### 3. Navegação/Menu
Atualizar `navbar.component.ts` e `sidebar.component.ts`:
```typescript
// ANTES
{ label: 'Alunos', route: '/alunos', icon: 'people' }

// DEPOIS
{ label: 'NAV.STUDENTS', route: '/students', icon: 'people' }
```

---

## 📝 Checklist

### Preparação
- [ ] Criar branch `refactor/frontend-i18n`
- [ ] Instalar @ngx-translate
- [ ] Configurar TranslateModule

### Traduções
- [ ] Criar arquivo `assets/i18n/pt-BR.json`
- [ ] Extrair todas as labels do sistema
- [ ] Organizar por contexto (NAV, STUDENT, COMMON, etc.)

### Renomeação
- [ ] Renomear `administracao/` → `administration/`
- [ ] Renomear `entrevistas/` → `interviews/`
- [ ] Renomear `perfil/` → `profile/`
- [ ] Renomear `voluntariado/` → `volunteering/`
- [ ] Consolidar duplicatas
- [ ] Atualizar todos os imports

### Templates
- [ ] Substituir labels hardcoded por pipes de tradução
- [ ] Atualizar mensagens do snackbar/toast
- [ ] Atualizar títulos de páginas

### Testes
- [ ] Build sem erros
- [ ] Todas as labels traduzidas
- [ ] Navegação funcionando
- [ ] Testes unitários passando

---

## 🚀 Estimativa de Tempo

| Fase | Tempo Estimado |
|------|----------------|
| 1. Setup i18n | 1 dia |
| 2. Arquivos de tradução | 2 dias |
| 3. Renomear pastas/componentes | 2-3 dias |
| 4. Atualizar templates | 2 dias |
| 5. Testes e validação | 1-2 dias |
| **TOTAL** | **8-10 dias** |

---

**Quer iniciar a implementação?** Posso começar pela Fase 1 (Setup do i18n)! 🚀
