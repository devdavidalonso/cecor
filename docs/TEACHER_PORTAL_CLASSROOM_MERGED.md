# 🚀 Plano Unificado: Portal do Professor + Google Classroom

**Portal do Professor com Integração Google Classroom - Fase A**  
**Versão:** 1.0 | **Data:** 20/02/2026

---

## 🎯 Visão do Projeto Unificado

Criar um **Portal do Professor** integrado ao **Google Classroom** onde:
- ✅ Professor gerencia suas turmas em um só lugar
- ✅ Criação de turmas no Google é automática
- ✅ Matrícula de alunos sincroniza automaticamente
- ✅ Acesso ao Google Classroom em um clique

---

## 📊 Escopo Combinado

### Funcionalidades do Portal do Professor (8 telas)
1. Dashboard do Professor
2. Minhas Turmas
3. Alunos da Turma
4. Registro de Presença
5. Calendário de Aulas
6. Ocorrências
7. Perfil do Aluno
8. Meu Perfil

### Funcionalidades Google Classroom (Fase A)
1. **Criação Automática de Turmas** (no cadastro de curso)
2. **Matrícula Automática de Alunos** (no wizard de matrícula)

---

## 🗓️ Cronograma Unificado (15 dias)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FASE 1: Estrutura + Dashboard (3 dias)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dia 1: Foundation                                                         │
│  ├── TeacherGuard (proteção de rotas)                                      │
│  ├── TeacherPortalService (com integração Google)                          │
│  ├── Configuração de rotas /teacher/*                                      │
│  └── Menu "Portal do Professor" na sidebar                                 │
│                                                                             │
│  Dia 2: Dashboard                                                          │
│  ├── API /api/v1/teacher/dashboard                                         │
│  ├── Componente TeacherDashboard                                           │
│  └── Cards de aulas com link Google Classroom                              │
│                                                                             │
│  Dia 3: Google Setup                                                       │
│  ├── Google Cloud Project config                                           │
│  ├── OAuth2 setup                                                          │
│  └── GoogleClassroomService (Go)                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              FASE 2: Turmas + Google Classroom Create (3 dias)             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dia 4: Minhas Turmas                                                      │
│  ├── API /api/v1/teacher/courses                                           │
│  ├── Componente MyCourses                                                  │
│  └── Cards com status Google Classroom                                     │
│                                                                             │
│  Dia 5: Criação Automática de Turmas                                       │
│  ├── Botão "Criar no Google Classroom" no cadastro de curso                │
│  ├── API POST /api/v1/courses/:id/classroom/create                         │
│  └── Integração Google Classroom API                                       │
│                                                                             │
│  Dia 6: Alunos da Turma + Integração                                       │
│  ├── Componente CourseStudents                                             │
│  └── Preparação para matrícula automática                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│           FASE 3: Presença + Matrícula Automática (4 dias)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dia 7-8: Registro de Presença                                             │
│  ├── Otimizar AttendanceRegistration existente                             │
│  ├── Validação 24h                                                         │
│  └── Integração com aulas do Google                                        │
│                                                                             │
│  Dia 9-10: Matrícula Automática                                            │
│  ├── Hook no wizard de matrícula                                           │
│  ├── API para convite Google Classroom                                     │
│  ├── Envio automático de convite por email                                 │
│  └── Tela de status de sincronização                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              FASE 4: Calendário + Ocorrências (3 dias)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dia 11-12: Calendário                                                     │
│  ├── Componente TeacherCalendar                                            │
│  ├── Integração visual com Google Calendar (opcional)                      │
│  └── Indicadores de aulas sincronizadas                                    │
│                                                                             │
│  Dia 13: Ocorrências                                                       │
│  ├── Componente IncidentsList                                              │
│  └── IncidentForm                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              FASE 5: Perfis + Testes Finais (2 dias)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dia 14: Perfis                                                            │
│  ├── StudentProfile (visão professor)                                      │
│  └── TeacherProfile                                                        │
│                                                                             │
│  Dia 15: Testes e Ajustes                                                  │
│  ├── Testes de integração Google Classroom                                 │
│  ├── Testes de permissões                                                  │
│  └── Documentação final                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Total: 15 dias úteis**

---

## 🔌 Integrações em Cada Tela

### 1. Dashboard do Professor
```typescript
interface TeacherDashboard {
  teacher: { id, name, email };
  todaySessions: ClassSession[];
  weeklyStats: {
    totalStudents: number;
    averageAttendance: number;
  };
  courses: CourseWithClassroom[]; // ← Integração Google
}

interface CourseWithClassroom extends Course {
  googleClassroomId?: string;      // ← ID da turma no Google
  googleClassroomUrl?: string;     // ← Link direto
  syncStatus: 'synced' | 'pending' | 'not_synced'; // ← Status
}
```

**Integração:**
- Cards de aula mostram botão "🎓 Abrir no Classroom" (se sincronizado)
- Alerta se turma ainda não foi criada no Google

---

### 2. Minhas Turmas
```
┌────────────────────────────────────────────────────────────────────┐
│  MINHAS TURMAS                                          [+ Curso] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 📘 Excel Básico - Turma 2026A                                │ │
│  │    🕘 Sábados 09:00-11:00 | Sala 3 | 👥 18 alunos          │ │
│  │                                                                │ │
│  │    Status Google Classroom:                                  │ │
│  │    🟢 Sincronizado ✓                                         │ │
│  │                                                                │ │
│  │    [✓ Chamada] [👥 Alunos] [🎓 Abrir Classroom]              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 📗 Word Avançado                                             │ │
│  │    🕑 Quartas 19:00-21:00 | Sala 2 | 👥 12 alunos          │ │
│  │                                                                │ │
│  │    Status Google Classroom:                                  │ │
│  │    🟡 Não sincronizado                                       │ │
│  │                                                                │ │
│  │    [🎓 Criar no Google Classroom] [✓ Chamada] [👥 Alunos]    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Integração:**
- Status de sincronização visível
- Botão "Criar no Google Classroom" (se não sincronizado)
- Botão "Abrir no Google Classroom" (se sincronizado)

---

### 3. Cadastro/Edição de Curso (Admin)
```
┌────────────────────────────────────────────────────────────────────┐
│  Cadastrar Curso                                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Nome do Curso: [Excel Básico - Turma 2026A        ]              │
│  Descrição:     [_________________________________]               │
│  Professor:     [Prof. Ana                    ▼]                  │
│  Carga Horária: [40          ] horas                              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  🎓 INTEGRAÇÃO GOOGLE CLASSROOM                              │ │
│  │                                                              │ │
│  │  [✓] Criar turma automaticamente no Google Classroom        │ │
│  │                                                              │ │
│  │  Quando salvar:                                              │ │
│  │  • Turma será criada no Google Classroom                    │ │
│  │  • Professor será configurado como dono                     │ │
│  │  • Alunos matriculados receberão convite automático        │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│              [❌ Cancelar]        [💾 Salvar e Criar Turma]        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Integração:**
- Checkbox "Criar no Google Classroom"
- Ao salvar, chama API do Google automaticamente
- Salva `google_classroom_id` e `google_classroom_url`

---

### 4. Matrícula de Aluno (Wizard)
```
┌────────────────────────────────────────────────────────────────────┐
│  Matricular Aluno - Passo 3 de 3                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Aluno: João da Silva                                             │
│  Curso: Excel Básico - Turma 2026A                                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  🎓 INTEGRAÇÃO GOOGLE CLASSROOM                              │ │
│  │                                                              │ │
│  │  Turma no Google: ✅ Criada                                  │ │
│  │  Email do aluno: joao.silva@gmail.com ✓                      │ │
│  │                                                              │ │
│  │  [✓] Enviar convite para turma virtual automaticamente      │ │
│  │                                                              │ │
│  │  O aluno receberá um email do Google para entrar na turma.  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│              [← Voltar]        [✅ Confirmar Matrícula]            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Integração:**
- Verifica se turma existe no Google
- Se sim, oferece enviar convite automaticamente
- Chama API do Google ao confirmar matrícula

---

### 5. Alunos da Turma
```
┌────────────────────────────────────────────────────────────────────┐
│  ← Excel Básico - Alunos Matriculados                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Status Google Classroom: 🟢 Sincronizado                         │
│  [🎓 Abrir no Google Classroom]  [🔄 Sincronizar Alunos]          │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 👤 João da Silva                                             │ │
│  │    📧 joao.silva@gmail.com                                   │ │
│  │    🟢 Google: Sincronizado ✓                                 │ │
│  │    🟢 Frequência: 95%                                        │ │
│  │    [👁 Ver] [! Ocorrência]                                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 👤 Maria Santos                                              │ │
│  │    📧 maria.santos@email.com                                 │ │
│  │    🟡 Google: Convite Pendente ⏳                            │ │
│  │    [Reenviar Convite]                                        │ │
│  │    🟢 Frequência: 88%                                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Integração:**
- Mostra status de sincronização por aluno
- Botão "Reenviar Convite" (se pendente)
- Botão "Sincronizar Todos" (envia convites em lote)

---

## 🏗️ Arquitetura de Integração

### Backend (Go)
```go
// service/googleclassroom/service.go
type Service interface {
    // Turmas
    CreateCourse(ctx context.Context, course *models.Course, teacher *models.User) (*classroom.Course, error)
    GetCourse(ctx context.Context, googleClassroomID string) (*classroom.Course, error)
    UpdateCourse(ctx context.Context, course *models.Course) error
    DeleteCourse(ctx context.Context, googleClassroomID string) error
    
    // Alunos
    EnrollStudent(ctx context.Context, courseID string, studentEmail string) error
    EnrollStudentsBatch(ctx context.Context, courseID string, emails []string) error
    GetEnrollments(ctx context.Context, courseID string) ([]*classroom.Student, error)
    RemoveStudent(ctx context.Context, courseID string, studentEmail string) error
    
    // Convites
    SendInvitation(ctx context.Context, courseID string, email string) (*classroom.Invitation, error)
    GetPendingInvitations(ctx context.Context, courseID string) ([]*classroom.Invitation, error)
}
```

### Frontend (Angular)
```typescript
// services/google-classroom.service.ts
@Injectable({ providedIn: 'root' })
export class GoogleClassroomService {
  private baseUrl = `${environment.apiUrl}/classroom`;

  // Turmas
  createClassroom(courseId: number): Observable<ClassroomSyncResult> {
    return this.http.post<ClassroomSyncResult>(
      `${this.baseUrl}/courses/${courseId}/create`, 
      {}
    );
  }

  // Alunos
  syncStudents(courseId: number): Observable<StudentSyncResult[]> {
    return this.http.post<StudentSyncResult[]>(
      `${this.baseUrl}/courses/${courseId}/sync-students`, 
      {}
    );
  }

  sendInvitation(courseId: number, studentId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/courses/${courseId}/students/${studentId}/invite`, 
      {}
    );
  }
}
```

---

## 📋 APIs Unificadas

### Teacher Portal APIs
```
GET    /api/v1/teacher/dashboard
GET    /api/v1/teacher/courses
GET    /api/v1/teacher/courses/:id/students
GET    /api/v1/teacher/sessions/today
POST   /api/v1/teacher/attendance/batch
GET    /api/v1/teacher/incidents
POST   /api/v1/teacher/incidents
GET    /api/v1/teacher/students/:id/profile
```

### Google Classroom APIs
```
POST   /api/v1/classroom/courses/:id/create          ← Criar turma
GET    /api/v1/classroom/courses/:id/status          ← Verificar status
POST   /api/v1/classroom/courses/:id/sync-students   ← Sincronizar alunos
POST   /api/v1/classroom/courses/:id/students/:id/invite  ← Enviar convite
GET    /api/v1/classroom/courses/:id/invitations     ← Listar convites pendentes
```

---

## 🗄️ Modelo de Dados (Atualizações)

### Tabela `courses`
```sql
ALTER TABLE courses ADD COLUMN google_classroom_id VARCHAR(255);
ALTER TABLE courses ADD COLUMN google_classroom_url VARCHAR(500);
ALTER TABLE courses ADD COLUMN google_sync_status VARCHAR(20) DEFAULT 'not_synced';
-- valores: 'not_synced', 'synced', 'error'
ALTER TABLE courses ADD COLUMN google_last_sync_at TIMESTAMP;
ALTER TABLE courses ADD COLUMN google_sync_error TEXT;
```

### Tabela `enrollments`
```sql
ALTER TABLE enrollments ADD COLUMN google_classroom_invitation_id VARCHAR(255);
ALTER TABLE enrollments ADD COLUMN google_invitation_status VARCHAR(20) DEFAULT 'pending';
-- valores: 'pending', 'accepted', 'error'
ALTER TABLE enrollments ADD COLUMN google_invitation_sent_at TIMESTAMP;
```

### Nova Tabela `google_sync_logs`
```sql
CREATE TABLE google_sync_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50), -- 'course', 'enrollment'
    entity_id INTEGER,
    operation VARCHAR(50), -- 'create_course', 'invite_student'
    status VARCHAR(20), -- 'success', 'error'
    google_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ Checklist de Entregas

### Fase 1: Estrutura (3 dias)
- [ ] TeacherGuard implementado
- [ ] Rotas /teacher/* configuradas
- [ ] Menu na sidebar
- [ ] Google Cloud Project configurado
- [ ] OAuth2 funcionando
- [ ] Dashboard básico

### Fase 2: Turmas + Criação (3 dias)
- [ ] Minhas Turmas listando
- [ ] Botão "Criar no Google Classroom"
- [ ] API de criação de turma
- [ ] Salvamento de IDs do Google
- [ ] Status de sincronização visível

### Fase 3: Presença + Matrícula (4 dias)
- [ ] Registro de presença otimizado
- [ ] Validação 24h
- [ ] Hook de matrícula automática
- [ ] Envio de convite Google
- [ ] Tela de status de convites

### Fase 4: Calendário + Ocorrências (3 dias)
- [ ] Calendário de aulas
- [ ] Lista de ocorrências
- [ ] Formulário de ocorrência

### Fase 5: Perfis + Testes (2 dias)
- [ ] Perfil do aluno (visão professor)
- [ ] Perfil do professor
- [ ] Testes de integração Google
- [ ] Testes de permissões
- [ ] Documentação

---

## 🎁 Benefícios do Projeto Unificado

| Benefício | Portal Professor | Google Classroom | Combinado |
|:----------|:-----------------|:-----------------|:----------|
| **Tempo economizado** | 20h/ano | 45h/ano | **65h/ano** |
| **Erros reduzidos** | Médio | Alto | **Muito Alto** |
| **Satisfação professor** | +30% | +40% | **+70%** |
| **Adoção sistema** | 70% | 90% | **95%** |

---

## 🚀 Próximo Passo

**Aprovar este plano unificado e iniciar Fase 1?**

Ou deseja ajustar alguma parte antes de começarmos?
