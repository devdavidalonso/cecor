# 📝 Comunicação para Entrevistas e Pesquisas - CECOR

**Data:** 21/02/2026  
**Escopo:** Entrevistas Socioeducacionais + Pesquisas de Termômetro (Satisfação/NPS)  
**Canais:** Email + Telegram + In-APP

---

## 📋 VISÃO GERAL

### Dois Tipos de Comunicação

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎤 ENTREVISTAS (Obrigatórias)                                 │
│  ├── Entrevista Socioeducacional (novo aluno)                  │
│  ├── Entrevista de Acompanhamento (periódica)                  │
│  └── Entrevista de Evasão (quando abandona)                    │
│                                                                 │
│  📊 PESQUISAS DE TERMÔMETRO (Opcionais)                        │
│  ├── Satisfação com Curso (trimestral)                         │
│  ├── NPS Geral CECOR (semestral)                               │
│  ├── Avaliação do Professor (final de curso)                   │
│  └── Pesquisa Rápida (eventos específicos)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎤 MÓDULO 1: ENTREVISTAS SOCIOEDUCACIONAIS

### 1.1 Fluxo de Entrevista (Novo Aluno)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. MATRÍCULA                                                   │
│     └── Aluno se matricula                                      │
│         ↓                                                       │
│  2. VERIFICAÇÃO AUTOMÁTICA                                      │
│     └── Sistema verifica: Tem entrevista pendente?              │
│         ↓ SIM                                                   │
│  3. NOTIFICAÇÃO ADMIN                                           │
│     └── "Novo aluno aguardando entrevista"                      │
│         ↓                                                       │
│  4. AGENDAMENTO                                                 │
│     └── Admin agenda entrevista                                 │
│         ↓                                                       │
│  5. NOTIFICAÇÃO ALUNO                                           │
│     └── "Sua entrevista está agendada"                          │
│         ↓                                                       │
│  6. REALIZAÇÃO                                                  │
│     └── Admin aplica entrevista                                 │
│         ↓                                                       │
│  7. CONCLUSÃO                                                   │
│     └── Sistema libera matrícula                                │
│         ↓                                                       │
│  8. CONFIRMAÇÃO                                                 │
│     └── Aluno recebe "Matrícula ativa"                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Gatilhos de Comunicação - Entrevistas

| Gatilho | Quem Notifica | Prioridade | Email | Telegram | In-APP | Forçar? |
|---------|---------------|------------|-------|----------|--------|---------|
| **Nova matrícula → entrevista pendente** | Admin/Coordenador | 🟡 | ✅ | ✅ | ✅ | ✅ Dashboard |
| **Entrevista agendada** | Aluno | 🔴 | ✅ | ✅ | ✅ | ✅ Modal |
| **Lembrete 24h antes** | Aluno | 🟡 | ✅ | ✅ | ❌ | ❌ |
| **Entrevista concluída** | Aluno | 🟢 | ✅ | ✅ | ✅ | ❌ |
| **Matrícula liberada** | Aluno | 🟡 | ✅ | ✅ | ✅ | ✅ Tela sucesso |
| **Entrevista NÃO realizada (atraso)** | Admin | 🔴 | ✅ | ✅ | ✅ | ✅ Alerta |
| **Resumo semanal (entrevistas pendentes)** | Admin | ⚪ | ✅ | ❌ | ❌ | ❌ |

### 1.3 Cenários Detalhados

#### CENÁRIO A: Novo Aluno - Aguardando Entrevista

```
┌─ NOTIFICAÇÃO PARA COORDENADOR ─┐
│                                 │
│  🔔 NOVO ALUNO AGUARDANDO       │
│     ENTREVISTA                  │
│                                 │
│  João Silva foi matriculado em  │
│  Inglês Básico - Turma A        │
│                                 │
│  ⚠️ ENTREVISTA SOCIOEDUCACIONAL │
│     PENDENTE                    │
│                                 │
│  📅 Agendar em até 48h          │
│                                 │
│  [📅 Agendar Entrevista]        │
│  [👤 Ver Perfil do Aluno]       │
│                                 │
└─────────────────────────────────┘

┌─ DASHBOARD ADMIN (FORÇADO) ─┐
│                              │
│  ⚠️ ENTREVISTAS PENDENTES   │
│                              │
│  ┌────────────────────────┐ │
│  │ João Silva             │ │
│  │ Matriculado: 20/02     │ │
│  │ Status: Aguardando     │ │
│  │ Dias em espera: 2      │ │
│  │ [Agendar]              │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │ Maria Santos           │ │
│  │ Matriculado: 19/02     │ │
│  │ Status: Aguardando     │ │
│  │ Dias em espera: 3      │ │
│  │ [Agendar]              │ │
│  └────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

#### CENÁRIO B: Entrevista Agendada - Notificação Aluno

```
┌─ IN-APP (FORÇADO - Modal) ─┐
│                             │
│  📅 ENTREVISTA AGENDADA     │
│                             │
│  Olá João!                  │
│                             │
│  Sua entrevista socioedu-   │
│  cional foi agendada:       │
│                             │
│  📆 Data: 25/02/2026        │
│  🕐 Horário: 14:00          │
│  📍 Local: Sala de Atendimento│
│  👤 Com: Ana (Assistente Social)│
│                             │
│  ⚠️ IMPORTANTE:             │
│  • Trazer documento de ID   │
│  • Chegar 10min antes       │
│  • Entrevista obrigatória   │
│    para ativação da matrícula│
│                             │
│  [✓ CONFIRMAR PRESENÇA]     │
│  [🔄 Solicitar Reagendamento]│
│                             │
└─────────────────────────────┘

┌─ TELEGRAM ─┐
┌─ EMAIL ─┐
│ 📅 CECOR  │  │ Assunto:    │
│           │  │ Entrevista  │
│ Entrevista│  │ Agendada -  │
│ agendada! │  │ CECOR       │
│           │  │             │
│ João, sua │  │ Olá João,   │
│ entrevista│  │             │
│ será dia  │  │ Sua entre-  │
│ 25/02 às  │  │ vista foi   │
│ 14h.      │  │ agendada    │
│           │  │ para:       │
│ Local:    │  │             │
│ Sala Atend│  │ 📆 25/02/2026│
│           │  │ 🕐 14:00    │
│ [Confirmar│  │ 📍 Sala de  │
│ presença] │  │    Atendimento│
│           │  │             │
│           │  │ ⚠️ Obrigatório│
│           │  │             │
│           │  │ [Confirmar] │
└───────────┘  └─────────────┘
```

#### CENÁRIO C: Entrevista em Atraso (Alerta)

```
┌─ ALERTA PARA COORDENADOR ─┐
│                            │
│  🚨 ENTREVISTA EM ATRASO  │
│                            │
│  João Silva               │
│  • Matriculado: 20/02     │
│  • Agendado: 25/02        │
│  • Status: NÃO COMPARECEU │
│                            │
│  ❌ Matrícula ainda       │
│     PENDENTE              │
│                            │
│  Ações disponíveis:       │
│  [📞 Contatar Aluno]      │
│  [📅 Reagendar]           │
│  [⚠️ Reportar Evasão]     │
│                            │
└───────────────────────────┘
```

---

### 1.4 Modelo de Dados Estendido

```go
// backend/internal/models/interview.go (MongoDB)

// InterviewSchedule - Agendamento de entrevista
type InterviewSchedule struct {
    ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    StudentID       uint               `json:"studentId" bson:"studentId"`
    EnrollmentID    uint               `json:"enrollmentId" bson:"enrollmentId"`
    
    // Agendamento
    ScheduledDate   time.Time          `json:"scheduledDate" bson:"scheduledDate"`
    ScheduledTime   string             `json:"scheduledTime" bson:"scheduledTime"`
    Location        string             `json:"location" bson:"location"`
    
    // Responsáveis
    InterviewerID   uint               `json:"interviewerId" bson:"interviewerId"` // Admin/Entrevistador
    InterviewerName string             `json:"interviewerName" bson:"interviewerName"`
    
    // Status
    Status          string             `json:"status" bson:"status"` // scheduled, completed, no_show, cancelled, rescheduled
    
    // Notificações
    NotificationsSent []NotificationLog `json:"notificationsSent" bson:"notificationsSent"`
    
    // Resultado
    FormResponseID  primitive.ObjectID `json:"formResponseId,omitempty" bson:"formResponseId,omitempty"`
    Notes           string             `json:"notes" bson:"notes"`
    
    CreatedAt       time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt       time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type NotificationLog struct {
    Type      string    `json:"type" bson:"type"` // email, telegram, inapp
    SentAt    time.Time `json:"sentAt" bson:"sentAt"`
    Status    string    `json:"status" bson:"status"` // sent, delivered, read
}
```

---

## 📊 MÓDULO 2: PESQUISAS DE TERMÔMETRO

### 2.1 Tipos de Pesquisa

| Pesquisa | Frequência | Quem Responde | Quando |
|----------|------------|---------------|--------|
| **Satisfação com Curso** | Trimestral | Alunos matriculados | Durante curso |
| **NPS Geral CECOR** | Semestral | Todos (alunos, professores, pais) | Jun/Dez |
| **Avaliação de Professor** | Final do curso | Alunos da turma | Última aula |
| **Pesquisa de Evasão** | Quando cancela | Ex-aluno | Após cancelamento |
| **Pesquisa Rápida (Evento)** | Eventos específicos | Participantes | Após evento |

### 2.2 Gatilhos de Comunicação - Pesquisas

| Gatilho | Quem Notifica | Prioridade | Email | Telegram | In-APP | Forçar? |
|---------|---------------|------------|-------|----------|--------|---------|
| **Pesquisa disponível** | Aluno/Professor | 🟡 | ✅ | ✅ | ✅ | ✅ Banner |
| **Lembrete pesquisa (metade prazo)** | Aluno | 🟡 | ✅ | ✅ | ❌ | ❌ |
| **Lembrete pesquisa (24h antes fechar)** | Aluno | 🟡 | ✅ | ✅ | ✅ | ✅ Modal |
| **Pesquisa respondida** | Aluno | 🟢 | ❌ | ✅ | ✅ | ❌ |
| **Resultados consolidados** | Admin/Coordenador | ⚪ | ✅ | ❌ | ❌ | ❌ |
| **Alerta baixa adesão (< 50%)** | Admin | 🟡 | ❌ | ❌ | ✅ | ✅ Dashboard |

### 2.3 Cenários Detalhados

#### CENÁRIO D: Pesquisa de Satisfação Trimestral

```
┌─ IN-APP (Banner Persistente) ─┐
│                                │
│  📊 SUA OPINIÃO É IMPORTANTE  │
│                                │
│  Ajude-nos a melhorar!        │
│                                │
│  Pesquisa de Satisfação       │
│  Inglês Básico - Turma A      │
│                                │
│  ⏰ Disponível até: 30/03     │
│  ⏱️ Tempo: 3 minutos          │
│                                │
│  [RESPONDER AGORA]  [✕ Depois]│
│                                │
└────────────────────────────────┘

┌─ TELEGRAM ─┐
│ 📊 CECOR   │
│            │
│ Pesquisa de│
│ Satisfação │
│ disponível!│
│            │
│ Curso:     │
│ Inglês     │
│ Básico     │
│            │
│ Responda e │
│ ajude a    │
│ melhorar   │
│ nosso      │
│ atendimento│
│            │
│ [Responder]│
└────────────┘
```

#### CENÁRIO E: Lembrete Urgente (24h antes de fechar)

```
┌─ IN-APP (Modal) ─┐
│                   │
│  ⏰ ÚLTIMO DIA!   │
│                   │
│  A pesquisa de    │
│  satisfação       │
│  fecha amanhã!    │
│                   │
│  Sua opinião é    │
│  muito importante │
│  para nós.        │
│                   │
│  [RESPONDER]      │
│  [Lembrar Depois] │
│                   │
└───────────────────┘
```

#### CENÁRIO F: Avaliação de Professor (Final de Curso)

```
┌─ IN-APP (FORÇADO - Tela Cheia) ─┐
│                                  │
│  🎓 AVALIAÇÃO DO CURSO           │
│                                  │
│  Parabéns! Você concluiu o      │
│  curso Inglês Básico!           │
│                                  │
│  Antes de receber seu           │
│  certificado, precisamos da     │
│  sua avaliação sobre:           │
│                                  │
│  ✅ Conteúdo do curso           │
│  ✅ Metodologia do professor    │
│  ✅ Estrutura física            │
│  ✅ Organização geral           │
│                                  │
│  ⏱️ Duração: 5 minutos          │
│                                  │
│  [INICIAR AVALIAÇÃO]            │
│                                  │
│  ⚠️ Esta avaliação é            │
│     obrigatória para emissão    │
│     do certificado              │
│                                  │
└──────────────────────────────────┘
```

#### CENÁRIO G: Alerta para Admin (Baixa Adesão)

```
┌─ DASHBOARD COORDENADOR ─┐
│                          │
│  ⚠️ BAIXA ADESÃO        │
│  PESQUISA DE SATISFAÇÃO │
│                          │
│  Curso: Inglês Básico   │
│  Turma: 2026A           │
│                          │
│  Respondido: 8/20 (40%) │
│  Meta: 80%              │
│                          │
│  Alunos pendentes:      │
│  • João Silva           │
│  • Maria Santos         │
│  • Carlos Pereira       │
│  • ... (mais 9)         │
│                          │
│  [📧 Enviar Lembrete]   │
│  [📞 Contatar Individual]│
│                          │
└─────────────────────────┘
```

---

### 2.4 Modelo de Dados - Pesquisas

```go
// backend/internal/models/survey.go (MongoDB)

// SurveyDefinition - Definição da pesquisa
type SurveyDefinition struct {
    ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    Title           string             `json:"title" bson:"title"`
    Description     string             `json:"description" bson:"description"`
    Type            string             `json:"type" bson:"type"` // course_satisfaction, nps, teacher_eval, exit_survey
    
    // Configuração
    Questions       []SurveyQuestion   `json:"questions" bson:"questions"`
    TargetAudience  string             `json:"targetAudience" bson:"targetAudience"` // students, teachers, parents, all
    
    // Período
    StartDate       time.Time          `json:"startDate" bson:"startDate"`
    EndDate         time.Time          `json:"endDate" bson:"endDate"`
    
    // Regras
    IsRequired      bool               `json:"isRequired" bson:"isRequired"` // Obrigatória para certificado?
    MinResponseTime int                `json:"minResponseTime" bson:"minResponseTime"` // Segundos mínimos
    
    // Notificações
    NotificationConfig SurveyNotificationConfig `json:"notificationConfig" bson:"notificationConfig"`
    
    // Filtros
    TargetCourses   []uint             `json:"targetCourses,omitempty" bson:"targetCourses,omitempty"`
    TargetClasses   []uint             `json:"targetClasses,omitempty" bson:"targetClasses,omitempty"`
    
    IsActive        bool               `json:"isActive" bson:"isActive"`
    CreatedByID     uint               `json:"createdById" bson:"createdById"`
    CreatedAt       time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt       time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type SurveyQuestion struct {
    ID       string                 `json:"id" bson:"id"`
    Type     string                 `json:"type" bson:"type"` // single_choice, multiple_choice, text, rating, nps
    Question string                 `json:"question" bson:"question"`
    Required bool                   `json:"required" bson:"required"`
    Options  []string               `json:"options,omitempty" bson:"options,omitempty"`
    Config   map[string]interface{} `json:"config,omitempty" bson:"config,omitempty"`
}

type SurveyNotificationConfig struct {
    InitialNotification   bool `json:"initialNotification" bson:"initialNotification"`     // Dia 1
    Reminder48h           bool `json:"reminder48h" bson:"reminder48h"`                     // Meio do prazo
    Reminder24h           bool `json:"reminder24h" bson:"reminder24h"`                     // 24h antes
    Channels              []string `json:"channels" bson:"channels"`                         // email, telegram, inapp
}

// SurveyResponse - Resposta do usuário
type SurveyResponse struct {
    ID          primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
    SurveyID    primitive.ObjectID     `json:"surveyId" bson:"surveyId"`
    UserID      uint                   `json:"userId" bson:"userId"`
    UserType    string                 `json:"userType" bson:"userType"` // student, teacher, parent
    
    // Contexto
    CourseID    *uint                  `json:"courseId,omitempty" bson:"courseId,omitempty"`
    ClassID     *uint                  `json:"classId,omitempty" bson:"classId,omitempty"`
    TeacherID   *uint                  `json:"teacherId,omitempty" bson:"teacherId,omitempty"`
    
    // Respostas
    Answers     map[string]interface{} `json:"answers" bson:"answers"`
    
    // Metadados
    StartedAt   time.Time              `json:"startedAt" bson:"startedAt"`
    CompletedAt time.Time              `json:"completedAt" bson:"completedAt"`
    IPAddress   string                 `json:"ipAddress" bson:"ipAddress"`
    UserAgent   string                 `json:"userAgent" bson:"userAgent"`
    
    CreatedAt   time.Time              `json:"createdAt" bson:"createdAt"`
}
```

---

## 🔄 MÓDULO 3: FLUXOS INTEGRADOS

### 3.1 Fluxo: Novo Aluno → Entrevista → Pesquisa

```
DIA 0: Matrícula
├── Sistema verifica: precisa de entrevista?
├── SIM → Notifica Admin (🟡)
└── Matrícula status: "pending_interview"

DIA 1: Agendamento
├── Admin agenda entrevista
├── Sistema notifica Aluno (🔴 Modal + Email + Telegram)
└── Aluno confirma presença

DIA 7: Entrevista Realizada
├── Admin aplica entrevista
├── Sistema: entrevista = completed
├── Matrícula status: "active"
└── Sistema notifica Aluno (🟢 "Matrícula ativa!")

DIA 30: Pesquisa Satisfação (1º mês)
├── Pesquisa automática liberada
├── Notificação Aluno (🟡 Banner)
├── Aluno responde
└── Agradecimento (🟢 Telegram)

DIA 90: Pesquisa Satisfação (3º mês)
└── Mesmo fluxo

DIA 180: Final do Curso
├── Avaliação Professor (🔴 Obrigatória!)
├── Aluno responde
├── Certificado liberado
└── Sistema notifica: "Certificado disponível!" (🟡)
```

### 3.2 Fluxo: Evasão → Pesquisa de Saída

```
Evento: Aluno cancela matrícula
│
├─► Sistema detecta: primeiro cancelamento
├─► Pesquisa de Evasão liberada automaticamente
├─► Notificação Aluno (🟡)
│   "Por que você está saindo? Ajude-nos a melhorar"
│
└─► Após 7 dias sem resposta:
    └── Lembrete (🟡 Email + Telegram)
    "Sua opinião é importante para melhorarmos"
```

---

## 📱 MÓDULO 4: IMPLEMENTAÇÃO TÉCNICA

### 4.1 Serviço de Notificação (Eventos)

```go
// backend/internal/service/notifications/interview_events.go

package notifications

// InterviewScheduledEvent - Entrevista agendada
func (s *service) OnInterviewScheduled(schedule models.InterviewSchedule) {
    // 1. Notificar aluno (URGENTE)
    s.SendNotification(SendRequest{
        UserIDs:     []uint{schedule.StudentID},
        EventType:   "interview_scheduled",
        Title:       "📅 Entrevista Agendada",
        Message:     fmt.Sprintf("Sua entrevista foi agendada para %s às %s", 
                     schedule.ScheduledDate.Format("02/01"), schedule.ScheduledTime),
        Priority:    "high",
        ForceInApp:  true,
        ActionURL:   fmt.Sprintf("/interviews/schedule/%s", schedule.ID.Hex()),
    })
    
    // 2. Notificar entrevistador
    s.SendNotification(SendRequest{
        UserIDs:     []uint{schedule.InterviewerID},
        EventType:   "interview_assigned",
        Title:       "🎤 Entrevista Atribuída",
        Message:     fmt.Sprintf("Você tem uma entrevista agendada com %s", 
                     getStudentName(schedule.StudentID)),
        Priority:    "medium",
        ForceInApp:  false,
    })
}

// SurveyAvailableEvent - Pesquisa disponível
func (s *service) OnSurveyAvailable(survey models.SurveyDefinition, userIDs []uint) {
    s.SendNotification(SendRequest{
        UserIDs:     userIDs,
        EventType:   "survey_available",
        Title:       "📊 Pesquisa Disponível",
        Message:     survey.Description,
        Priority:    "medium",
        ForceInApp:  true, // Banner persistente
        ActionURL:   fmt.Sprintf("/surveys/%s", survey.ID.Hex()),
        Data: map[string]interface{}{
            "surveyId":  survey.ID.Hex(),
            "endDate":   survey.EndDate,
            "isRequired": survey.IsRequired,
        },
    })
}

// SurveyReminderEvent - Lembrete de pesquisa
func (s *service) OnSurveyReminder(survey models.SurveyDefinition, userIDs []uint) {
    s.SendNotification(SendRequest{
        UserIDs:     userIDs,
        EventType:   "survey_reminder",
        Title:       "⏰ Lembrete: Pesquisa",
        Message:     fmt.Sprintf("A pesquisa '%s' fecha em 24h. Sua opinião é importante!", survey.Title),
        Priority:    "high",
        ForceInApp:  true, // Modal
        ActionURL:   fmt.Sprintf("/surveys/%s", survey.ID.Hex()),
    })
}
```

### 4.2 Job Agendado (Lembretes Automáticos)

```go
// backend/internal/jobs/notification_jobs.go

package jobs

// CheckPendingInterviews - Verifica entrevistas pendentes
func CheckPendingInterviews(db *mongo.Database, notifyService notifications.Service) {
    // Todo dia às 9h
    
    // 1. Entrevistas agendadas para amanhã → Lembrete
    tomorrow := time.Now().Add(24 * time.Hour)
    filter := bson.M{
        "scheduledDate": bson.M{"$gte": tomorrow, "$lt": tomorrow.Add(24 * time.Hour)},
        "status": "scheduled",
    }
    
    var schedules []models.InterviewSchedule
    db.Collection("interview_schedules").Find(context.Background(), filter).All(&schedules)
    
    for _, s := range schedules {
        notifyService.SendNotification(notifications.SendRequest{
            UserIDs:    []uint{s.StudentID},
            EventType:  "interview_reminder",
            Title:      "⏰ Lembrete: Entrevista Amanhã",
            Message:    fmt.Sprintf("Não esqueça: sua entrevista é amanhã às %s", s.ScheduledTime),
            Priority:   "medium",
            ForceInApp: false,
        })
    }
    
    // 2. Pesquisas fechando em 24h → Lembrete urgente
    surveysClosing := getSurveysClosingSoon(db, 24*time.Hour)
    for _, survey := range surveysClosing {
        pendingUsers := getPendingUsers(db, survey.ID)
        notifyService.OnSurveyReminder(survey, pendingUsers)
    }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Entrevistas (2 dias)
- [ ] Model InterviewSchedule (MongoDB)
- [ ] Endpoint: Agendar entrevista
- [ ] Notificação: Nova entrevista pendente (Admin)
- [ ] Notificação: Entrevista agendada (Aluno)
- [ ] Job: Lembrete 24h antes
- [ ] Tela: Agendamento (Admin)
- [ ] Tela: Confirmação (Aluno)

### Fase 2: Pesquisas (3 dias)
- [ ] Model SurveyDefinition (MongoDB)
- [ ] CRUD: Criar pesquisa (Admin)
- [ ] Notificação: Pesquisa disponível
- [ ] Notificação: Lembrete pesquisa
- [ ] Job: Verificar pesquisas fechando
- [ ] Tela: Responder pesquisa (Aluno/Professor)
- [ ] Dashboard: Resultados consolidados

### Fase 3: Integração (1 dia)
- [ ] Conectar com sistema de notificações existente
- [ ] Testar fluxo completo
- [ ] Configurar preferências de notificação

---

## 📊 RESUMO DOS GATILHOS

| Categoria | Total de Gatilhos | Forçam In-APP |
|-----------|-------------------|---------------|
| **Entrevistas** | 7 | 4 (57%) |
| **Pesquisas** | 6 | 3 (50%) |
| **Total** | **13** | **7 (54%)** |

---

## 💡 RECOMENDAÇÕES

### 1. Não Saturar o Usuário
```
REGRA DE OURO:
├── Máximo 1 pesquisa por mês por aluno
├── Entrevista só no início (ou anual)
└── Pesquisa de evasão só se cancelar
```

### 2. Incentivar Resposta
```
ESTRATÉGIAS:
├── Mostrar: "X de Y alunos já responderam"
├── Certificado só libera após avaliação
└── Agradecimento público (opcional)
```

### 3. Respeitar Privacidade
```
LGPD:
├── Pesquisas anônimas por padrão
├── Opção "Não quero receber pesquisas"
└── Dados agregados apenas
```

---

**Documento criado em:** 21/02/2026  
**Próxima ação:** Implementar InterviewSchedule e SurveyDefinition
