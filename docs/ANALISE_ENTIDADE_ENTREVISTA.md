# 📋 Análise da Entidade Entrevista - CECOR

**Data:** 21/02/2026  
**Objetivo:** Racionalizar a entidade Entrevista no contexto do sistema CECOR e propor implementação do wizard de matrícula com entrevista

---

## 1. 🎯 Contexto: O Formulário Google Original

O [formulário de matrícula atual](https://docs.google.com/forms/d/1rHSEhgksUtonMCZFjEYPO0t32gvTbJIYArgWrxSlL0U) foi dividido em **5 grandes seções**:

| Página | Conteúdo | Status no CECOR |
|--------|----------|-----------------|
| **1** | Escolha de Cursos e Horários | ✅ Implementado (Courses + Enrollments) |
| **2** | Dados do Aluno | ✅ Implementado (Students + Users) |
| **3** | Família e Responsáveis | ✅ Implementado (Guardians) |
| **4** | Saúde e Autorizações | ✅ Implementado (Students - medical_info) |
| **5** | Perfil Socioeducacional | ⚠️ **Parcial** (últimas 17 páginas = Entrevista) |

> 🔍 **Observação Crítica:** As "últimas 17 páginas" do formulário Google representam a **Entrevista Socioeducacional** que ainda não está completamente implementada no sistema.

---

## 2. 🏗️ Arquitetura Atual de Entrevistas

### 2.1 Estrutura de Dados (MongoDB)

```go
// FormDefinition - Questionário Dinâmico
type FormDefinition struct {
    ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    Title       string             `json:"title" bson:"title"`           // ex: "Perfil Inicial 2026"
    Version     string             `json:"version" bson:"version"`       // ex: "v1_2026"
    Description string             `json:"description" bson:"description"`
    IsActive    bool               `json:"isActive" bson:"isActive"`
    Questions   []Question         `json:"questions" bson:"questions"`
    CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
}

type Question struct {
    ID          string   `json:"id" bson:"id"`               // unique key: "income_level"
    Label       string   `json:"label" bson:"label"`         // "Renda familiar mensal?"
    Type        string   `json:"type" bson:"type"`           // text | select | boolean | multiple_choice
    Options     []string `json:"options,omitempty" bson:"options,omitempty"`
    Required    bool     `json:"required" bson:"required"`
    Placeholder string   `json:"placeholder,omitempty" bson:"placeholder,omitempty"`
}
```

```go
// InterviewResponse - Respostas do Aluno
type InterviewResponse struct {
    ID              primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
    StudentID       uint                   `json:"studentId" bson:"studentId"`
    FormVersion     string                 `json:"formVersion" bson:"formVersion"`
    Status          string                 `json:"status" bson:"status"` // pending | completed
    Answers         map[string]interface{} `json:"answers" bson:"answers"`
    InterviewerID   uint                   `json:"interviewerId,omitempty" bson:"interviewerId,omitempty"`
    CompletionDate  time.Time              `json:"completionDate" bson:"completionDate"`
    CreatedAt       time.Time              `json:"createdAt" bson:"createdAt"`
}
```

### 2.2 Tipos de Perguntas Suportados

| Tipo | Descrição | Uso |
|------|-----------|-----|
| `text` | Resposta dissertativa curta | Nome, expectativas |
| `select` | Escolha única em dropdown | Escolaridade, faixa etária |
| `boolean` | Sim/Não | Trabalha atualmente? |
| `multiple_choice` | Múltiplas seleções | Quais cursos já fez? |

---

## 3. 🔄 Fluxo de Negócio Proposto

### 3.1 Fluxo de Matrícula Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WIZARD DE MATRÍCULA CECOR                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  PASSO 1     │───▶│  PASSO 2     │───▶│  PASSO 3     │          │
│  │ Seleção de   │    │ Dados do     │    │ Revisão +    │          │
│  │ Curso        │    │ Aluno        │    │ Contrato     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                              │            │
│         ▼                                              ▼            │
│  ┌──────────────┐                           ┌─────────────────────┐│
│  │  Após        │                           │ Matrícula Criada    ││
│  │  seleção:    │                           │ Status: pending     ││
│  │  Verificar   │                           │ interview           ││
│  │  entrevista  │                           └──────────┬──────────┘│
│  │  pendente?   │                                      │           │
│  └──────┬───────┘                                      │           │
│         │                                              │           │
│         │ SIM (não tem entrevista)                     │           │
│         ▼                                              ▼           │
│  ┌──────────────────────────────────────────┐    ┌──────────────┐  │
│  │   REDIRECIONAR PARA                    │    │   LIBERADO   │  │
│  │   /interviews/new                      │    │   (com       │  │
│  │                                          │    │   entrevista)│  │
│  │   Entrevista Socioeducacional           │    │              │  │
│  │   (admin responde perguntas do          │    │              │  │
│  │    formulário dinâmico)                 │    │              │  │
│  └──────────────────────────────────────────┘    └──────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Papéis no Processo de Entrevista

| Papel | Ação no Sistema | Permissões |
|-------|-----------------|------------|
| **Admin/Gestor** | Busca aluno → Inicia entrevista → Responde questionário | Criar/Editar/Ver todas entrevistas |
| **Aluno** | Não acessa diretamente | Após entrevista, acesso liberado |
| **Professor** | Visualiza resumo da entrevista | Read-only das respostas relevantes |

---

## 4. 💻 Implementação Necessária

### 4.1 Backend (Go)

#### Novos Endpoints API

```go
// === ADMIN: Gerenciamento de Formulários ===

// Criar novo formulário de entrevista
POST   /api/v1/admin/interview-forms
Request:  FormDefinition JSON
Response: 201 Created { id, title, version }

// Listar todos os formulários
GET    /api/v1/admin/interview-forms
Response: 200 OK [ { id, title, version, isActive, questionCount } ]

// Atualizar formulário
PUT    /api/v1/admin/interview-forms/:id
Request:  FormDefinition JSON
Response: 200 OK

// Ativar/Desativar formulário
PATCH  /api/v1/admin/interview-forms/:id/status
Request:  { isActive: boolean }
Response: 200 OK

// === MATRÍCULA: Fluxo de Entrevista ===

// Verificar se aluno tem entrevista pendente
GET    /api/v1/interviews/pending?studentId=123
Response: 
  - 200 OK { formDefinition } → Tem entrevista pendente
  - 204 No Content → Não tem entrevista pendente
  - 400 Bad Request → studentId obrigatório

// Submeter respostas da entrevista
POST   /api/v1/interviews/response
Request: {
  studentId: 123,
  formVersion: "v1_2026",
  answers: {
    trabalha_atualmente: false,
    escolaridade: "Ensino Médio Incompleto",
    expectativa: "Conseguir emprego"
  }
}
Response: 201 Created

// === CONSULTA: Visualização de Respostas ===

// Buscar resposta da entrevista de um aluno
GET    /api/v1/interviews/student/:studentId
Response: 200 OK { InterviewResponse }
```

#### Repositorio MongoDB - Novos Métodos

```go
type FormRepository interface {
    // Já existentes
    GetActiveForm(ctx context.Context) (*models.FormDefinition, error)
    CreateForm(ctx context.Context, form *models.FormDefinition) error
    SaveResponse(ctx context.Context, response *models.InterviewResponse) error
    GetResponseByStudent(ctx context.Context, studentID uint) (*models.InterviewResponse, error)
    
    // NOVOS MÉTODOS
    ListAllForms(ctx context.Context) ([]models.FormDefinition, error)
    GetFormByID(ctx context.Context, id string) (*models.FormDefinition, error)
    UpdateForm(ctx context.Context, id string, form *models.FormDefinition) error
    UpdateFormStatus(ctx context.Context, id string, isActive bool) error
    DeleteForm(ctx context.Context, id string) error
}
```

### 4.2 Frontend (Angular)

#### Novos Componentes

```
src/app/features/
├── interviews/
│   ├── components/
│   │   ├── interviews-list.component.ts      (Lista de respostas)
│   │   ├── interview-form.component.ts       (Responder entrevista - DINÂMICO)
│   │   ├── interview-detail.component.ts     (Ver resposta)
│   │   └── dynamic-question/                 (Componente de pergunta dinâmica)
│   │       ├── text-question.component.ts
│   │       ├── select-question.component.ts
│   │       ├── boolean-question.component.ts
│   │       └── multiple-choice.component.ts
│   ├── services/
│   │   └── interview.service.ts
│   └── models/
│       ├── form-definition.model.ts
│       ├── question.model.ts
│       └── interview-response.model.ts
│
└── administration/
    └── components/
        └── interview-form-builder/           (Criar/editar formulários)
            ├── form-builder.component.ts
            ├── question-editor.component.ts
            └── form-preview.component.ts
```

#### Novos Models (Frontend)

```typescript
// interview.model.ts

export interface FormDefinition {
  id?: string;
  title: string;
  version: string;
  description: string;
  isActive: boolean;
  questions: Question[];
  createdAt?: Date;
}

export interface Question {
  id: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'multiple_choice';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface InterviewResponse {
  id?: string;
  studentId: number;
  formVersion: string;
  status: 'pending' | 'completed';
  answers: { [key: string]: any };
  interviewerId?: number;
  completionDate?: Date;
  createdAt?: Date;
}
```

#### Serviço de Entrevista

```typescript
// interview.service.ts

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  // Verificar entrevista pendente
  getPendingInterview(studentId: number): Observable<FormDefinition | null> {
    return this.http.get<FormDefinition>(
      `${this.apiUrl}/interviews/pending?studentId=${studentId}`
    ).pipe(
      catchError(err => {
        if (err.status === 204) return of(null);
        throw err;
      })
    );
  }

  // Submeter respostas
  submitResponse(response: InterviewResponse): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/interviews/response`, 
      response
    );
  }

  // Buscar resposta de um aluno
  getStudentInterview(studentId: number): Observable<InterviewResponse> {
    return this.http.get<InterviewResponse>(
      `${this.apiUrl}/interviews/student/${studentId}`
    );
  }

  // === ADMIN: Gerenciamento de Formulários ===
  
  listForms(): Observable<FormDefinition[]> {
    return this.http.get<FormDefinition[]>(
      `${this.apiUrl}/admin/interview-forms`
    );
  }

  createForm(form: FormDefinition): Observable<FormDefinition> {
    return this.http.post<FormDefinition>(
      `${this.apiUrl}/admin/interview-forms`, 
      form
    );
  }

  updateForm(id: string, form: FormDefinition): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/admin/interview-forms/${id}`, 
      form
    );
  }

  updateFormStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/admin/interview-forms/${id}/status`, 
      { isActive }
    );
  }
}
```

---

## 5. 🎨 Interface do Wizard de Matrícula

### 5.1 Tela: Busca do Aluno (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│  Entrevista Socioeducacional - Nova Matrícula               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔍 Buscar Aluno                                    │   │
│  │                                                     │   │
│  │  [Nome ou CPF do aluno.....................] [🔍]   │   │
│  │                                                     │   │
│  │  Sugestões:                                         │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ João da Silva (CPF: 123.456.789-00)    ▶    │   │   │
│  │  │ Maria Santos (CPF: 987.654.321-00)     ▶    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Aluno Selecionado: João da Silva                   │   │
│  │  CPF: 123.456.789-00 | Tel: (11) 99999-9999        │   │
│  │                                                     │   │
│  │  Curso: Violão para Iniciantes                      │   │
│  │  Horário: Ter/Qui 14:00-16:00                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 Questionário: Perfil Socioeducacional 2026      │   │
│  │                                                     │   │
│  │  1. Você trabalha atualmente? *                    │   │
│  │     ( ) Sim  ( ) Não                                │   │
│  │                                                     │   │
│  │  2. Qual sua escolaridade? *                       │   │
│  │     [Selecione ▼]                                   │   │
│  │                                                     │   │
│  │  3. Quais cursos já fez no CECOR?                  │   │
│  │     [☑] Violão  [☑] Informática  [ ] Costura       │   │
│  │                                                     │   │
│  │  4. Qual sua expectativa com o curso? *            │   │
│  │     [Digite sua resposta aqui...]                   │   │
│  │                                                     │   │
│  │  ... (perguntas dinâmicas do formulário)           │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│              [Cancelar]        [Salvar Rascunho] [Finalizar]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Tela: Builder de Formulários (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│  🛠️ Criar Novo Formulário de Entrevista                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Título: [Perfil Socioeducacional 2026...............]     │
│  Versão: [v1_2026]                                          │
│  Descrição: [Formulário para novos alunos CECOR...]        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Perguntas                                          │   │
│  │                                                     │   │
│  │  ┌─ Pergunta 1 ────────────────────────────────┐   │   │
│  │  │ Label: [Você trabalha atualmente?......]   │   │   │
│  │  │ Tipo:  [Booleano ▼]                         │   │   │
│  │  │ Obrigatória: [☑]                            │   │   │
│  │  │ [🗑️] [⬆] [⬇]                              │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─ Pergunta 2 ────────────────────────────────┐   │   │
│  │  │ Label: [Qual sua escolaridade?...........]   │   │   │
│  │  │ Tipo:  [Seleção ▼]                          │   │   │
│  │  │ Opções:                                     │   │   │
│  │  │   • Ensino Fundamental                      │   │   │
│  │  │   • Ensino Médio                            │   │   │
│  │  │   • [+ Adicionar opção]                     │   │   │
│  │  │ Obrigatória: [☑]                            │   │   │
│  │  │ [🗑️] [⬆] [⬇]                              │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  [+ Adicionar Pergunta]                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│         [Cancelar]        [Visualizar]      [Salvar]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 📊 Integração com Matrícula

### 6.1 Estados da Matrícula

```typescript
export enum EnrollmentStatus {
  ACTIVE = 'active',                    // ✅ Matrícula completa
  PENDING_INTERVIEW = 'pending_interview', // ⏳ Aguardando entrevista
  WAITING_LIST = 'waiting_list',        // 🕐 Lista de espera
  INACTIVE = 'inactive',                // ❌ Inativa
  COMPLETED = 'completed'               // 🎓 Curso concluído
}
```

### 6.2 Regra de Negócio

```typescript
// enrollment.service.ts - Pseudo-código

async createEnrollment(enrollmentData: EnrollmentData) {
  // 1. Criar matrícula
  const enrollment = await this.enrollmentRepo.create({
    ...enrollmentData,
    status: 'pending_interview' // Sempre começa assim
  });

  // 2. Verificar se existe formulário de entrevista ativo
  const activeForm = await this.interviewService.getActiveForm();
  
  if (activeForm) {
    // 3. Redirecionar para entrevista
    return {
      enrollmentId: enrollment.id,
      nextStep: 'INTERVIEW_REQUIRED',
      redirectUrl: `/interviews/new?studentId=${enrollment.studentId}`
    };
  }
  
  // 4. Se não tem formulário ativo, liberar matrícula
  await this.enrollmentRepo.updateStatus(enrollment.id, 'active');
  
  return {
    enrollmentId: enrollment.id,
    nextStep: 'COMPLETED',
    redirectUrl: `/enrollments/${enrollment.id}/success`
  };
}
```

---

## 7. 🗂️ Roadmap de Implementação

### Fase 1: Backend (Semana 1-2)
- [ ] Criar endpoints CRUD para formulários (`/admin/interview-forms`)
- [ ] Implementar métodos no repository MongoDB
- [ ] Criar seed com formulário "Perfil Inicial 2026"
- [ ] Adicionar validações de permissão (admin vs. professor)

### Fase 2: Frontend - Admin (Semana 3)
- [ ] Tela de listagem de formulários
- [ ] Builder de formulários (criar/editar)
- [ ] Preview de formulário

### Fase 3: Frontend - Wizard de Matrícula (Semana 4)
- [ ] Integrar tela de busca de aluno
- [ ] Criar componente dinâmico de perguntas
- [ ] Implementar fluxo de redirecionamento
- [ ] Tela de sucesso/erro

### Fase 4: Visualização de Respostas (Semana 5)
- [ ] Tela de detalhe da entrevista
- [ ] Resumo no perfil do aluno
- [ ] Exportar respostas (PDF)

---

## 8. 📈 Considerações Finais

### Pontos Fortes da Arquitetura
1. **Flexibilidade:** MongoDB permite alterar perguntas sem migração de banco
2. **Versionamento:** Cada formulário tem versão (v1_2026, v2_2027...)
3. **Histórico:** Respostas preservadas mesmo com formulários desativados
4. **Multi-tenant:** Um dia pode suportar múltiplas ONGs com formulários diferentes

### Riscos e Mitigações
| Risco | Mitigação |
|-------|-----------|
| Aluno sem entrevista travado | Botão "Pular por agora" com lembrete |
| Formulário muito longo | Paginação de perguntas no frontend |
| Dados sensíveis | Criptografia no MongoDB + LGPD compliance |

---

**Próximo Passo:** Aprovar este documento e iniciar implementação da Fase 1 (Backend).
