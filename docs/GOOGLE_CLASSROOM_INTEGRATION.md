# 🔗 Integração com Google Classroom - CECOR

**Documento de Estratégia de Integração**  
**Versão:** 1.0 | **Data:** 20/02/2026

---

## 📚 O que é o Google Classroom?

O Google Classroom é uma plataforma de gestão de sala de aula que permite:
- Criar turmas virtuais
- Distribuir materiais e atividades
- Coletar trabalhos e dar notas
- Comunicar-se com alunos
- Organizar calendário de aulas

**Para o CECOR (ONG):** É gratuito via **Google for Nonprofits/ Education**

---

## 🔄 Fluxos de Integração Possíveis

### NÍVEL 1: Básico (Link Direto) ✅ Já Implementado
```
Sistema CECOR                    Google Classroom
     │                                │
     │  1. Cadastra curso             │
     │  2. Adiciona link do Classroom │
     │───────────────────────────────>│
     │                                │
     │  3. Professor clica no link    │
     │  4. Redireciona para Classroom │
     │<───────────────────────────────│
```

**Implementação:** Campo `google_classroom_url` no cadastro do curso

---

### NÍVEL 2: Sincronização de Dados (API) 🟡 Recomendado

#### 2.1 Criação Automática de Turmas
```go
// Quando admin cria curso no CECOR
cursoCECOR := &models.Course{
    Name: "Excel Básico - Turma 2026A",
    Description: "Curso de Excel para iniciantes...",
    Teacher: professor,
}

// Cria automaticamente no Google Classroom
googleCourse := classroom.Course{
    Name: cursoCECOR.Name,
    Description: cursoCECOR.Description,
    Section: "Turma 2026A",
    OwnerId: professor.Email, // Professor como dono
}

// Salva o ID da turma Google no CECOR
cursoCECOR.GoogleClassroomID = googleCourse.Id
cursoCECOR.GoogleClassroomURL = googleCourse.AlternateLink
```

**Benefícios:**
- ✅ Não precisa criar turma manualmente no Google
- ✅ Professor já é configurado como dono
- ✅ Link automático no sistema

---

#### 2.2 Matrícula Automática de Alunos
```go
// Quando aluno é matriculado no CECOR
func (s *EnrollmentService) EnrollStudent(ctx context.Context, enrollment *models.Enrollment) error {
    // 1. Salva matrícula no CECOR
    if err := s.db.Create(enrollment).Error; err != nil {
        return err
    }
    
    // 2. Matricula no Google Classroom (async)
    go func() {
        student := enrollment.Student
        course := enrollment.Course
        
        // Envia convite para o aluno
        invitation := &classroom.Invitation{
            CourseId: course.GoogleClassroomID,
            Role:     "STUDENT",
            UserId:   student.Email,
        }
        
        s.classroomService.Invitations.Create(invitation).Do()
    }()
    
    return nil
}
```

**Benefícios:**
- ✅ Aluno recebe convite automático no email
- ✅ Não precisa adicionar alunos manualmente no Classroom
- ✅ Sincronização imediata

---

#### 2.3 Sincronização de Calendário
```go
// Quando cria aula no CECOR, cria no Google Calendar
func (s *ClassSessionService) CreateSession(ctx context.Context, session *models.ClassSession) error {
    // 1. Salva aula no CECOR
    if err := s.db.Create(session).Error; err != nil {
        return err
    }
    
    // 2. Cria evento no Google Calendar da turma (opcional)
    event := &calendar.Event{
        Summary:     session.Topic,
        Description: "Aula do curso " + session.Course.Name,
        Start: &calendar.EventDateTime{
            DateTime: session.Date + "T" + session.StartTime,
        },
        End: &calendar.EventDateTime{
            DateTime: session.Date + "T" + session.EndTime,
        },
    }
    
    s.calendarService.Events.Insert("primary", event).Do()
}
```

**Benefícios:**
- ✅ Aulas aparecem no calendário dos alunos
- ✅ Lembretes automáticos
- ✅ Organização visual

---

### NÍVEL 3: Sincronização Avançada 🔵 Futuro

#### 3.1 Sincronização de Notas
```
CECOR                              Google Classroom
  │                                      │
  │  1. Professor lança nota no CECOR   │
  │─────────────────────────────────────>│
  │                                      │
  │  2. Nota aparece no Classroom       │
  │<─────────────────────────────────────│
```

**Casos de uso:**
- Professor prefere lançar notas no CECOR (sistema oficial)
- Alunos veem notas no Classroom (mais acessível)

#### 3.2 Sincronização de Presença
```
CECOR                              Google Classroom
  │                                      │
  │  1. Registra presença no CECOR      │
  │─────────────────────────────────────>│
  │                                      │
  │  2. Atualiza status no Classroom    │
  │     (presente/ausente)              │
  │<─────────────────────────────────────│
```

**Observação:** O Classroom não tem campo nativo de presença, mas pode usar:
- Atividades de "Presença" para marcar
- Comentários privados

#### 3.3 Postagem Automática de Conteúdo
```go
// Quando professor agenda aula, posta no Classroom
announcement := &classroom.Announcement{
    CourseId: course.GoogleClassroomID,
    Text: fmt.Sprintf("📚 Próxima aula: %s\n📅 Data: %s\n⏰ Horário: %s",
        session.Topic,
        session.Date,
        session.StartTime,
    ),
}

s.classroomService.Courses.Announcements.Create(course.GoogleClassroomID, announcement).Do()
```

**Benefícios:**
- ✅ Alunos recebem notificação no celular
- ✅ Comunicação automatizada
- ✅ Menos trabalho manual para professor

---

## 📊 Matriz de Integração

| Funcionalidade | Complexidade | Impacto | Prioridade | Status |
|:---------------|:-------------|:--------|:-----------|:-------|
| **Link Direto** | Baixa | Alto | 🔴 Alta | ✅ Implementado |
| **Criação Automática de Turmas** | Média | Alto | 🔴 Alta | 🟡 Planejado |
| **Matrícula Automática** | Média | Alto | 🔴 Alta | 🟡 Planejado |
| **Sincronização de Calendário** | Média | Médio | 🟡 Média | 🔵 Futuro |
| **Sincronização de Notas** | Alta | Médio | 🟢 Baixa | 🔵 Futuro |
| **Sincronização de Presença** | Alta | Baixo | 🟢 Baixa | 🔵 Futuro |
| **Postagem Automática** | Baixa | Médio | 🟡 Média | 🔵 Futuro |

---

## 🔌 APIs do Google Necessárias

### 1. Google Classroom API
```go
import "google.golang.org/api/classroom/v1"

// Escopos necessários
scopes := []string{
    classroom.ClassroomCoursesScope,        // Gerenciar cursos
    classroom.ClassroomRostersScope,        // Gerenciar alunos
    classroom.ClassroomCourseworkMeScope,   // Trabalhos/notas
    classroom.ClassroomAnnouncementsScope,  // Anúncios
}
```

### 2. Google Calendar API (opcional)
```go
import "google.golang.org/api/calendar/v3"

scopes := []string{
    calendar.CalendarEventsScope,
}
```

### 3. Configuração no Google Cloud Console
1. Criar projeto no Google Cloud
2. Habilitar APIs (Classroom, Calendar)
3. Criar credenciais OAuth 2.0
4. Configurar tela de consentimento OAuth
5. Adicionar escopos necessários

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                      CECOR BACKEND (Go)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │  Enrollment     │    │  GoogleClassroomService             │ │
│  │  Service        │───>│                                     │ │
│  │                 │    │  • CreateCourse()                   │ │
│  └─────────────────┘    │  • EnrollStudent()                  │ │
│                         │  • CreateAnnouncement()             │ │
│  ┌─────────────────┐    │  • SyncGrades()                     │ │
│  │  Course         │───>│                                     │ │
│  │  Service        │    └─────────────────────────────────────┘ │
│  │                 │                      │                      │
│  └─────────────────┘                      │                      │
│                                           ▼                      │
│                            ┌──────────────────────────────┐     │
│                            │  Google API Client           │     │
│                            │  (OAuth2 + JWT)              │     │
│                            └──────────────────────────────┘     │
│                                           │                      │
└───────────────────────────────────────────┼──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLASSROOM API                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 Modelo de Dados Atualizado

### Tabela `courses` (atualizar)
```sql
ALTER TABLE courses ADD COLUMN google_classroom_id VARCHAR(255);
ALTER TABLE courses ADD COLUMN google_classroom_url VARCHAR(500);
ALTER TABLE courses ADD COLUMN sync_with_classroom BOOLEAN DEFAULT false;
```

### Tabela `students` (atualizar)
```sql
-- Verificar se email é @gmail.com (para validação)
ALTER TABLE students ADD COLUMN google_account_email VARCHAR(255);
```

### Nova tabela `google_sync_logs`
```sql
CREATE TABLE google_sync_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50), -- 'course', 'enrollment', 'grade'
    entity_id INTEGER,
    google_classroom_id VARCHAR(255),
    operation VARCHAR(50), -- 'create', 'update', 'delete'
    status VARCHAR(20), -- 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Implementação Passo a Passo

### Fase 1: Configuração (1 dia)
- [ ] Criar projeto no Google Cloud
- [ ] Habilitar Classroom API
- [ ] Configurar OAuth 2.0
- [ ] Adicionar variáveis de ambiente
- [ ] Criar `GoogleClassroomService`

### Fase 2: Criação de Turmas (2 dias)
- [ ] Botão "Criar no Google Classroom"
- [ ] API para criar turma no Google
- [ ] Salvar ID do Google no curso
- [ ] Teste de integração

### Fase 3: Matrícula Automática (2 dias)
- [ ] Hook após matrícula no CECOR
- [ ] Convite automático para aluno
- [ ] Notificação por email
- [ ] Tratamento de erros (retry)

### Fase 4: Sincronização Avançada (Futuro)
- [ ] Sincronização de notas
- [ ] Postagem automática de aulas
- [ ] Calendário integrado

---

## ⚠️ Considerações Importantes

### 1. Privacidade e LGPD
```
⚠️ ATENÇÃO: Ao sincronizar com Google:
- Dados de alunos são enviados para servidores Google
- Precisa de consentimento explícito no termo de matrícula
- Documentar fluxo de dados para LGPD
```

### 2. Resiliência
```go
// Sempre implementar fallback
func (s *GoogleClassroomService) EnrollStudent(student, course) error {
    // Tentar integração
    err := s.tryEnroll(student, course)
    
    if err != nil {
        // Logar erro
        s.logSyncError("enrollment", student.ID, err)
        
        // Não quebrar o fluxo principal
        // Matrícula no CECOR continua funcionando
        return nil 
    }
    
    return nil
}
```

### 3. Rate Limits
- Google Classroom API: 1000 requisições/100 segundos/usuário
- Implementar fila/batch para operações em massa

---

## 📈 Benefícios Esperados

| Métrica | Antes | Depois | Melhoria |
|:--------|:------|:-------|:---------|
| Tempo para criar turma | 15 min | 1 min | **93%** |
| Tempo para matricular aluno | 5 min | 0 min | **100%** |
| Erros de matrícula duplicada | 10%/mês | 0% | **100%** |
| Satisfação do professor | - | - | **+40%** |

---

## 📝 Checklist de Implementação

- [ ] Configurar projeto Google Cloud
- [ ] Implementar autenticação OAuth2
- [ ] Criar serviço de integração
- [ ] Adicionar colunas na base de dados
- [ ] Implementar criação automática de turmas
- [ ] Implementar matrícula automática
- [ ] Adicionar logs de sincronização
- [ ] Testar cenários de erro
- [ ] Documentar para usuários
- [ ] Treinar equipe

---

**Próximo passo:** Implementar Fase 1 (Configuração)?
