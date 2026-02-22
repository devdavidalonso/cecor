# 🎯 MISSÃO RAMBO - Plano de Execução CECOR

**Versão:** 1.0 - "Operação Sem Quebrar"  
**Data:** 21/02/2026  
**Prioridade:** Portal do Aluno + Estabilidade  
**Lema:** "Rápido, mas sem deixar rastro de sangue" 🩸

---

## 🚀 VISÃO GERAL DA ESTRATÉGIA

```
┌─────────────────────────────────────────────────────────────────┐
│              ESTRATÉGIA: "PONTE PARA O FUTURO"                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FASE 1: PORTAL DO ALUNO (2 semanas)                           │
│  ├── Objetivo: Entregar valor IMEDIATO aos alunos              │
│ ├── Tática: Usar modelo ATUAL (sem mudar arquitetura)          │
│  └── Resultado: Alunos acessam frequência, cursos, perfil      │
│                                                                 │
│         ↓ (sistema estável, usuários felizes)                  │
│                                                                 │
│  FASE 2: GAPS ESTRUTURAIS (3 semanas)                          │
│  ├── Objetivo: Preparar terreno para escala                    │
│  ├── Tática: Migração GRADUAL com dual-mode                    │
│  └── Resultado: Course → Turma, Skills, etc.                   │
│                                                                 │
│         ↓ (sistema robusto, pronto para crescer)               │
│                                                                 │
│  FASE 3: POLIMENTO + NOTIFICAÇÕES (1 semana)                   │
│  ├── Objetivo: Excelência operacional                          │
│  ├── Tática: Telegram, melhorias UX, relatórios                │
│  └── Resultado: Sistema "redondo"                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 PRIORIZAÇÃO: O QUE FAZER PRIMEIRO?

### Matrix de Decisão Rambo

| Tarefa | Valor para Aluno | Complexidade | Risco de Quebrar | Ordem |
|--------|------------------|--------------|------------------|-------|
| **Portal do Aluno - Dashboard** | 🔴 ALTO | 🟢 Baixo | 🟢 Baixo | **1º** |
| **Portal do Aluno - Frequência** | 🔴 ALTO | 🟢 Baixo | 🟢 Baixo | **1º** |
| **Separar Course/Turma** | 🟡 Médio | 🔴 Alto | 🔴 Alto | **3º** |
| **Sistema de Skills** | 🟡 Médio | 🟡 Médio | 🟡 Médio | **4º** |
| **Telegram Notifications** | 🟡 Médio | 🟢 Baixo | 🟢 Baixo | **2º** |
| **Entrevistas/Pesquisas** | 🟢 Baixo | 🟡 Médio | 🟢 Baixo | **5º** |
| **Ementas (Syllabus)** | 🟢 Baixo | 🟡 Médio | 🟢 Baixo | **6º** |

**Regra de Ouro:**
> "Se quebra o sistema atual, vai para depois do Portal do Aluno estar 100%"

---

## 🎓 FASE 1: PORTAL DO ALUNO (Semanas 1-2)

### Objetivo
Entregar aos alunos acesso à própria frequência e cursos SEM mexer na arquitetura atual.

### Por que primeiro?
- ✅ Usa modelo atual (Course = Turma por enquanto)
- ✅ Zero risco de quebrar sistema existente
- ✅ Valor imediato: alunos veem frequência
- ✅ Base para testar APIs novas

### Escopo Fase 1

```
PORTAL DO ALUNO (MVP Funcional)
│
├── Backend (3 dias)
│   ├── GET /api/v1/student/dashboard
│   ├── GET /api/v1/student/courses
│   ├── GET /api/v1/student/courses/:id/attendance
│   ├── GET /api/v1/student/profile
│   └── GET /api/v1/student/incidents (read-only)
│
├── Frontend (5 dias)
│   ├── StudentGuard (proteção de rotas)
│   ├── Dashboard (meus cursos + aulas hoje)
│   ├── Meus Cursos (lista com frequência)
│   ├── Detalhe de Frequência (histórico)
│   ├── Minhas Ocorrências (read-only)
│   └── Meu Perfil (editar dados de contato)
│
└── Testes (2 dias)
    ├── Testar com 3 perfis (aluno de cada curso)
    ├── Verificar segurança (aluno A não vê aluno B)
    └── Performance (< 3s por tela)
```

### APIs Específicas (Sem mexer no modelo atual)

```go
// NOVAS APENAS - Não modificam tabelas existentes

// GET /api/v1/student/dashboard
func (h *Handler) GetStudentDashboard(w http.ResponseWriter, r *http.Request) {
    userID := getUserFromContext(r)
    studentID := getStudentIDByUserID(userID)
    
    // Usa ENROLLMENTS atuais (course_id)
    enrollments := h.enrollmentRepo.GetByStudent(studentID)
    
    // Usa CLASS_SESSIONS atuais
    todaySessions := h.sessionRepo.GetTodayForStudent(studentID)
    
    // Usa ATTENDANCE atual
    stats := calculateAttendanceStats(enrollments)
    
    json.NewEncoder(w).Encode(StudentDashboardResponse{
        Student:       getStudentInfo(studentID),
        TodaySessions: todaySessions,
        Courses:       formatCoursesWithAttendance(enrollments),
        Alerts:        generateAlerts(stats),
    })
}
```

### Estratégia de NÃO Quebrar

```go
// TUDO NOVO - Zero mudanças em tabelas existentes

// ✅ FAZER: Criar novos handlers
/backend/internal/api/handlers/student_portal_handler.go  // NOVO

// ✅ FAZER: Criar novas rotas
/api/v1/student/*  // NOVO

// ❌ NÃO FAZER: Alterar tabelas existentes
// ❌ NÃO FAZER: Modificar handlers de teacher/admin
// ❌ NÃO FAZER: Mudar relacionamentos Course/Enrollment
```

### Timeline Fase 1

| Dia | Tarefa | Responsável | Entregável |
|-----|--------|-------------|------------|
| 1 | Setup rotas + StudentGuard | Dev | Rotas protegidas |
| 2 | API Dashboard + Cursos | Dev | Backend student |
| 3 | API Frequência + Perfil | Dev | Backend completo |
| 4 | Frontend Dashboard | Dev | Tela dashboard |
| 5 | Frontend Meus Cursos | Dev | Lista cursos |
| 6 | Frontend Frequência | Dev | Histórico attendance |
| 7 | Frontend Ocorrências + Perfil | Dev | Telas restantes |
| 8 | Testes integração | QA | Bug fixes |
| 9 | Testes segurança | QA | Ajustes |
| 10 | Deploy + Monitoramento | DevOps | Produção |

**Resultado Fase 1:** Portal do Aluno funcional, sistema estável 🎉

---

## 🔧 FASE 2: GAPS ESTRUTURAIS (Semanas 3-5)

### Objetivo
Resolver problemas arquiteturais (Course/Turma) SEM quebrar o que funciona.

### Estratégia: "Ponte para o Futuro"

```
Modelo Atual (Funciona)          Modelo Novo (Futuro)
┌─────────────┐                  ┌─────────────┐
│   Course    │                  │   Course    │
│  (com tudo) │                  │  (catálogo) │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       ↓                                ↓
┌─────────────┐                  ┌─────────────┐
│ Enrollment  │      PONTE      │CourseClass  │
│  course_id  │◄────────────────┤   (turma)   │
└─────────────┘   (dual-mode)   └──────┬──────┘
                                       │
                                       ↓
                                ┌─────────────┐
                                │  Enrollment │
                                │course_class_id│
                                └─────────────┘
```

### Fase 2A: Preparação (Semana 3)

```go
// PASSO 1: Criar tabelas NOVAS (não alterar existentes)

// Nova tabela: course_classes (turmas)
CREATE TABLE course_classes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),  -- FK para Course
    code VARCHAR(20),  -- "2026A", "2026B"
    name VARCHAR(200),
    -- ... campos de horário, professor, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

// Nova tabela: enrollment_course_class (ponte)
CREATE TABLE enrollment_course_classes (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id),
    course_class_id INTEGER REFERENCES course_classes(id),
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

// Nova coluna (nullable): class_sessions.course_class_id
ALTER TABLE class_sessions ADD COLUMN course_class_id INTEGER NULL REFERENCES course_classes(id);
-- Mantém course_id existente! (backward compatible)
```

### Fase 2B: Migração de Dados (Semana 3 - Cont.)

```go
// PASSO 2: Script de migração (roda uma vez)

func MigrateToCourseClasses(db *gorm.DB) error {
    return db.Transaction(func(tx *gorm.DB) error {
        // Para cada curso existente, criar uma turma padrão
        var courses []Course
        tx.Find(&courses)
        
        for _, course := range courses {
            // Criar turma "padrão" com dados do curso
            class := CourseClass{
                CourseID:     course.ID,
                Code:         "2026A",
                Name:         course.Name + " - Turma A",
                WeekDays:     course.WeekDays,
                StartTime:    course.StartTime,
                EndTime:      course.EndTime,
                StartDate:    course.StartDate,
                EndDate:      course.EndDate,
                MaxStudents:  course.MaxStudents,
                // ... copiar todos os campos
            }
            tx.Create(&class)
            
            // Migrar enrollments para ponte
            var enrollments []Enrollment
            tx.Where("course_id = ?", course.ID).Find(&enrollments)
            for _, e := range enrollments {
                tx.Create(&EnrollmentCourseClass{
                    EnrollmentID:  e.ID,
                    CourseClassID: class.ID,
                    IsPrimary:     true,
                })
            }
            
            // Migrar class_sessions (opcional - pode ser lazy)
            tx.Model(&ClassSession{}).
                Where("course_id = ?", course.ID).
                Update("course_class_id", class.ID)
        }
        
        return nil
    })
}
```

### Fase 2C: Dual-Mode (Semanas 4-5)

```go
// PASSO 3: APIs em modo DUAL (aceitam ambos)

type CreateEnrollmentRequest struct {
    StudentID       uint `json:"studentId" binding:"required"`
    CourseClassID   uint `json:"courseClassId"`  // NOVO (preferencial)
    CourseID        uint `json:"courseId"`       // LEGADO (deprecated)
}

func (h *Handler) CreateEnrollment(c *gin.Context) {
    var req CreateEnrollmentRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // COMPATIBILIDADE: Se recebeu course_id, converte para course_class_id
    if req.CourseClassID == 0 && req.CourseID != 0 {
        // Buscar turma padrão do curso
        class, err := h.classRepo.GetDefaultByCourse(req.CourseID)
        if err != nil {
            c.JSON(400, gin.H{"error": "course_id deprecated, informe course_class_id"})
            return
        }
        req.CourseClassID = class.ID
    }
    
    // Criar enrollment NO MODO NOVO
    enrollment := Enrollment{
        StudentID: req.StudentID,
        // Não preenche course_id mais! Só course_class_id via ponte
    }
    
    // Salvar
    h.enrollmentRepo.Create(&enrollment)
    
    // Criar ponte
    h.enrollmentClassRepo.Create(&EnrollmentCourseClass{
        EnrollmentID:  enrollment.ID,
        CourseClassID: req.CourseClassID,
        IsPrimary:     true,
    })
    
    c.JSON(201, enrollment)
}

// PASSO 4: Queries em DUAL (leem de ambos)

func (r *repo) GetStudentCourses(studentID uint) ([]Course, error) {
    // Tenta modo novo primeiro
    var classes []CourseClass
    r.db.
        Joins("JOIN enrollment_course_classes ecc ON ecc.course_class_id = course_classes.id").
        Joins("JOIN enrollments e ON e.id = ecc.enrollment_id").
        Where("e.student_id = ?", studentID).
        Find(&classes)
    
    if len(classes) > 0 {
        // Modo novo: retorna cursos das turmas
        return r.getCoursesFromClasses(classes), nil
    }
    
    // Fallback modo legado
    var courses []Course
    r.db.
        Joins("JOIN enrollments e ON e.course_id = courses.id").
        Where("e.student_id = ?", studentID).
        Find(&courses)
    
    return courses, nil
}
```

### Timeline Fase 2

| Semana | Dia | Tarefa | Estratégia |
|--------|-----|--------|------------|
| 3 | 1-2 | Criar tabelas novas | Zero alteração em tabelas existentes |
| 3 | 3-4 | Script de migração | Roda em background, reversível |
| 3 | 5 | Testar migração | Validação completa |
| 4 | 1-3 | APIs em dual-mode | Aceita course_id e course_class_id |
| 4 | 4-5 | Frontend: selecionar turma A/B/C | Dropdown de turmas |
| 5 | 1-3 | Testes integração | Portal do Aluno continua funcionando |
| 5 | 4-5 | Deploy gradual | 10% → 50% → 100% |

**Resultado Fase 2:** Course/Turma separados, sistema estável 🎉

---

## 🚀 FASE 3: POLIMENTO + NOTIFICAÇÕES (Semana 6)

### Objetivo
Entregar excelência: Telegram, melhorias UX, relatórios.

### Escopo

```
POLIMENTO FINAL
│
├── Notificações (3 dias)
│   ├── Setup bot Telegram (@BotFather)
│   ├── Serviço TelegramService
│   ├── Notificações: entrevistas
│   ├── Notificações: pesquisas
│   └── Notificações: alertas frequência
│
├── UX/UI (2 dias)
│   ├── Skeleton loading states
│   ├── Toast notifications
│   ├── Animações de transição
│   └── Responsividade mobile
│
└── Relatórios (1 dia)
    ├── Export frequência (PDF)
    ├── Dashboard admin (métricas)
    └── Relatório semanal (email)
```

### Timeline Fase 3

| Dia | Tarefa | Impacto |
|-----|--------|---------|
| 1 | Bot Telegram + config | Comunicação gratuita |
| 2 | Notificações backend | Sistema inteligente |
| 3 | Notificações frontend | UX superior |
| 4 | Skeleton + Loading | Percepção de velocidade |
| 5 | Relatórios PDF | Valor administrativo |

---

## 📅 PLANO DE EXECUÇÃO COMPLETO (6 Semanas)

```
SEMANA 1: Portal do Aluno - Backend
├─ Dia 1: Setup + APIs Dashboard
├─ Dia 2: APIs Cursos + Frequência
├─ Dia 3: APIs Perfil + Ocorrências
├─ Dia 4: Testes APIs
└─ Dia 5: Revisão + Ajustes

SEMANA 2: Portal do Aluno - Frontend
├─ Dia 1: Dashboard + Rotas
├─ Dia 2: Meus Cursos
├─ Dia 3: Frequência
├─ Dia 4: Ocorrências + Perfil
└─ Dia 5: Testes + Deploy

SEMANA 3: Gaps - Preparação
├─ Dia 1-2: Criar tabelas (turmas, skills)
├─ Dia 3-4: Script migração
└─ Dia 5: Validar migração

SEMANA 4: Gaps - Dual Mode
├─ Dia 1-2: APIs dual-mode
├─ Dia 3: Frontend selecionar turma
└─ Dia 4-5: Testes integração

SEMANA 5: Gaps - Finalização
├─ Dia 1-2: Sistema de Skills
├─ Dia 3: Testes substituição
└─ Dia 4-5: Deploy gradual

SEMANA 6: Polimento
├─ Dia 1-2: Telegram
├─ Dia 3: Notificações
├─ Dia 4: UX/UI
└─ Dia 5: Relatórios + Lançamento 🚀
```

---

## 🛡️ ESTRATÉGIAS DE SEGURANÇA (Não Quebrar)

### 1. Feature Flags

```go
// Habilitar/desabilitar funcionalidades

var FeatureFlags = struct {
    StudentPortal    bool `env:"FF_STUDENT_PORTAL" default:"true"`
    CourseClasses    bool `env:"FF_COURSE_CLASSES" default:"false"`
    TelegramNotif    bool `env:"FF_TELEGRAM" default:"false"`
    SkillsSystem     bool `env:"FF_SKILLS" default:"false"`
}{
    // Se algo quebrar, desabilita via env var
}

// Uso
if FeatureFlags.CourseClasses {
    // Usa novo modelo
} else {
    // Usa modelo legado
}
```

### 2. Deploy Gradual (Canary)

```
Deploy Fase 2 (Course/Turma):
│
├── Dia 1: 5% dos usuários (teste interno)
├── Dia 2: 20% (beta testers)
├── Dia 3: 50% (metade)
├── Dia 4: 100% (todos)
└── Rollback: < 5 min se erro
```

### 3. Backup Antes de Mudar

```bash
# Antes de cada fase
pg_dump cecor > backup_pre_fase_2.sql

# Se der erro
psql cecor < backup_pre_fase_2.sql
```

### 4. Dual-Write (Transição)

```go
// Escreve em AMBOS os modelos durante migração

func CreateEnrollment(data EnrollmentData) {
    // Modo legado (garante compatibilidade)
    legacyEnrollment := LegacyEnrollment{
        StudentID: data.StudentID,
        CourseID:  data.CourseID,  // Ainda funciona
    }
    db.Create(&legacyEnrollment)
    
    // Modo novo (prepara futuro)
    if FeatureFlags.CourseClasses {
        newEnrollment := NewEnrollment{
            StudentID:       data.StudentID,
            CourseClassID:   data.CourseClassID,
        }
        db.Create(&newEnrollment)
    }
}
```

---

## 🎯 CRONOGRAMA VISUAL

```
        SEMANA 1       SEMANA 2       SEMANA 3       SEMANA 4       SEMANA 5       SEMANA 6
       ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ PORTAL   │   │ PORTAL   │   │ GAPS     │   │ GAPS     │   │ GAPS     │   │ POLIMENTO│
       │ ALUNO    │   │ ALUNO    │   │ PREP     │   │ DUAL     │   │ FINAL    │   │          │
       │ Backend  │   │ Frontend │   │          │   │ MODE     │   │          │   │          │
       └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
               │              │              │              │              │              │
               ▼              ▼              ▼              ▼              ▼              ▼
         🎉 Entrega 1   🎉 Entrega 2   🎉 Entrega 3   🎉 Entrega 4   🎉 Entrega 5   🚀 LAUNCH!
         Portal OK      Portal OK      Migração OK    Dual OK        Skills OK      Tudo OK!
```

---

## ✅ CHECKLIST DE SUCESSO

### Fase 1 - Portal do Aluno
- [ ] Aluno A vê própria frequência
- [ ] Aluno A não vê dados do Aluno B
- [ ] Dashboard carrega < 3s
- [ ] Mobile responsivo
- [ ] Zero erros em produção

### Fase 2 - Gaps Estruturais
- [ ] Migração rodou sem erro
- [ ] Sistema funciona em dual-mode
- [ ] Novas matrículas usam turmas
- [ ] Matrículas antigas continuam funcionando
- [ ] Rollback testado e funciona

### Fase 3 - Polimento
- [ ] Telegram enviando mensagens
- [ ] Notificações chegando no horário
- [ ] Loading states suaves
- [ ] PDF export funcionando
- [ ] NPS > 50 (satisfação)

---

## 🚨 PLANO DE CONTINGÊNCIA

### "Se der merda..."

| Problema | Solução | Tempo de Recuperação |
|----------|---------|----------------------|
| Portal do Aluno com bug | Feature flag OFF | 2 min |
| Migração de dados falhou | Restaurar backup | 15 min |
| Dual-mode confuso usuários | Voltar para legado | 5 min |
| Telegram parou | Fallback para email | 0 min (automático) |
| Performance ruim | Cache + otimização | 1 dia |

---

## 💪 MISSÃO RAMBO: RESUMO EXECUTIVO

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎯 OBJETIVO: Portal do Aluno funcionando em 2 semanas          │
│                                                                 │
│  🛡️ ESTRATÉGIA: Nunca quebrar o que funciona                   │
│                                                                 │
│  ⚡ VELOCIDADE: Dual-mode, feature flags, deploy gradual        │
│                                                                 │
│  📅 PRAZO: 6 semanas para tudo (Portal + Gaps + Polimento)      │
│                                                                 │
│  🚀 RESULTADO: Sistema robusto, escalável, usuários felizes     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤔 DECISÃO FINAL

**Aprova esse plano "Missão Rambo"?**

Opções:
1. **🚀 APROVADO - Bora executar!** (começar Fase 1 imediatamente)
2. **✏️ Ajustar algo** (qual parte mudar?)
3. **⏸️ Pensar mais** (adicionar/remover escopo)

**Qual sua decisão, comandante?** 🫡
