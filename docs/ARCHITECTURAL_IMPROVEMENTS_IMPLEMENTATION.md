# 🏗️ Implementação de Melhorias Arquiteturais - CECOR

**Data:** 21/02/2026  
**Escopo:** Separar Course/Turma, Estruturar Ementas, Sistema de Substituição  
**Prioridade:** Alta (bloqueia escala)

---

## 📋 Resumo das 3 Mudanças

| # | Problema | Solução | Impacto |
|---|----------|---------|---------|
| 1 | Course = curso + turma + horário | Criar **CourseClass** (Turma) | Permite A/B/C no mesmo curso |
| 2 | Topic é string solta | Criar **SyllabusTopic** (Ementa) | Reuso, planejamento |
| 3 | Substituir professor é difícil | **TeacherSkill + Availability** | Busca inteligente |

---

## 🗄️ 1. SEPARAÇÃO: Course → CourseClass

### 1.1 Modelo Atual (Problema)

```
Course (Inglês Básico)
├── WeekDays, StartTime, EndTime ← TURMA A
├── ClassSessions ← TURMA A
├── Enrollments ← TURMA A
└── TeacherCourses ← TURMA A

PROBLEMA: Não dá para ter Turma B com horário diferente!
```

### 1.2 Modelo Novo (Solução)

```
Course (Inglês Básico) ← Catálogo
├── SyllabusTopics ← Ementas do curso
└── CourseClasses (Turmas)
    ├── 2026A (Sáb 09-11, Prof Ana, Sala 3)
    │   ├── ClassSessions ← Aulas da Turma A
    │   └── Enrollments ← Alunos da Turma A
    └── 2026B (Ter/Qui 19-21, Prof Carlos, Sala 2)
        ├── ClassSessions ← Aulas da Turma B
        └── Enrollments ← Alunos da Turma B
```

### 1.3 Modelo de Dados (Go)

```go
// backend/internal/models/course.go

// Course - Catálogo de cursos (template)
type Course struct {
    ID                  uint      `json:"id" gorm:"primaryKey"`
    Name                string    `json:"name" gorm:"not null"`
    ShortDescription    string    `json:"shortDescription"`
    DetailedDescription string    `json:"detailedDescription" gorm:"type:text"`
    Workload            int       `json:"workload" gorm:"not null"`
    Prerequisites       string    `json:"prerequisites"`
    DifficultyLevel     string    `json:"difficultyLevel"`
    TargetAudience      string    `json:"targetAudience"`
    CategoryID          *uint     `json:"categoryId" gorm:"index"` // NOVO: Categoria
    Category            *CourseCategory `json:"category,omitempty"`
    Status              string    `json:"status" gorm:"not null;default:'active'"`
    CreatedAt           time.Time `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt           time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
    
    // Associations
    SyllabusTopics []SyllabusTopic `json:"syllabusTopics,omitempty"`
    CourseClasses  []CourseClass   `json:"courseClasses,omitempty"`
}

// CourseClass (Turma) - Instância concreta do curso
type CourseClass struct {
    ID                 uint       `json:"id" gorm:"primaryKey"`
    CourseID           uint       `json:"courseId" gorm:"not null;index"`
    Course             Course     `json:"course,omitempty"`
    Code               string     `json:"code" gorm:"not null"` // "2026A", "2026B"
    Name               string     `json:"name"` // "Inglês Básico - Turma A"
    
    // Configuração de horário (padrão)
    WeekDays           string     `json:"weekDays" gorm:"not null"` // "1,3,5" = Seg/Qua/Sex
    StartTime          string     `json:"startTime" gorm:"not null"` // "09:00"
    EndTime            string     `json:"endTime" gorm:"not null"` // "11:00"
    StartDate          time.Time  `json:"startDate" gorm:"not null"`
    EndDate            time.Time  `json:"endDate" gorm:"not null"`
    
    // Configuração de sala e professor (padrão)
    DefaultLocationID  *uint      `json:"defaultLocationId" gorm:"index"`
    DefaultLocation    *Location  `json:"defaultLocation,omitempty"`
    DefaultTeacherID   *uint      `json:"defaultTeacherId" gorm:"index"`
    DefaultTeacher     *Teacher   `json:"defaultTeacher,omitempty"`
    
    // Capacidade
    Capacity           int        `json:"capacity" gorm:"not null;default:30"`
    MaxStudents        int        `json:"maxStudents" gorm:"not null"`
    
    // Google Classroom
    GoogleClassroomURL string     `json:"googleClassroomUrl"`
    GoogleClassroomID  string     `json:"googleClassroomId"`
    
    // Status
    Status             string     `json:"status" gorm:"not null;default:'active'"` // active, completed, cancelled
    CreatedAt          time.Time  `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt          time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
    
    // Associations
    ClassSessions  []ClassSession  `json:"classSessions,omitempty"`
    Enrollments    []Enrollment    `json:"enrollments,omitempty"`
}

// CourseCategory - Categorização de cursos
type CourseCategory struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" gorm:"not null;unique"` // "Idiomas", "Tecnologia", "Artes"
    Description string    `json:"description"`
    Color       string    `json:"color"` // Hex para UI
    Icon        string    `json:"icon"`  // Nome do ícone
    Order       int       `json:"order"` // Ordem de exibição
    CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}
```

### 1.4 Modificações em Models Existentes

```go
// ClassSession agora aponta para CourseClass (Turma)
type ClassSession struct {
    ID                 uint         `json:"id" gorm:"primaryKey"`
    CourseClassID      uint         `json:"courseClassId" gorm:"not null;index"` // NOVO
    CourseClass        CourseClass  `json:"courseClass,omitempty"` // NOVO
    CourseID           uint         `json:"courseId" gorm:"not null;index"` // DEPRECATED: manter para compat
    
    // Overrides específicos da aula
    LocationID         *uint        `json:"locationId" gorm:"index"`
    Location           *Location    `json:"location,omitempty"`
    TeacherID          *uint        `json:"teacherId" gorm:"index"` // Substituto
    Teacher            *Teacher     `json:"teacher,omitempty"`
    
    Date               time.Time    `json:"date" gorm:"not null"`
    StartTime          string       `json:"startTime"` // Override
    EndTime            string       `json:"endTime"`   // Override
    
    // Ementa
    SyllabusTopicID    *uint        `json:"syllabusTopicId" gorm:"index"` // NOVO
    SyllabusTopic      *SyllabusTopic `json:"syllabusTopic,omitempty"`
    TopicOverride      string       `json:"topicOverride"` // Tema especial
    
    IsCancelled        bool         `json:"isCancelled" gorm:"default:false"`
    CancellationReason string       `json:"cancellationReason"`
    CreatedAt          time.Time    `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt          time.Time    `json:"updatedAt" gorm:"autoUpdateTime"`
}

// Enrollment agora é na Turma, não no Course
type Enrollment struct {
    ID                     uint        `json:"id" gorm:"primaryKey"`
    StudentID              uint        `json:"studentId" gorm:"not null;index"`
    CourseClassID          uint        `json:"courseClassId" gorm:"not null;index"` // NOVO
    CourseClass            CourseClass `json:"courseClass,omitempty"` // NOVO
    CourseID               uint        `json:"courseId" gorm:"not null;index"` // DEPRECATED
    // ... resto mantém
}
```

---

## 📚 2. EMENTAS: SyllabusTopic

### 2.1 Modelo

```go
// backend/internal/models/syllabus.go

// SyllabusTopic - Item de ementa reutilizável
type SyllabusTopic struct {
    ID              uint      `json:"id" gorm:"primaryKey"`
    CourseID        uint      `json:"courseId" gorm:"not null;index"`
    Course          Course    `json:"course,omitempty"`
    
    Title           string    `json:"title" gorm:"not null"` // "Apresentação Pessoal"
    Description     string    `json:"description" gorm:"type:text"`
    Content         string    `json:"content" gorm:"type:text"` // Conteúdo detalhado
    Objectives      string    `json:"objectives" gorm:"type:text"` // O que o aluno vai aprender
    
    // Recursos/Materiais (JSONB)
    Resources       string    `json:"resources" gorm:"type:jsonb"` // [{"type": "pdf", "url": "..."}]
    
    // Metadados
    EstimatedSessions int     `json:"estimatedSessions" gorm:"default:1"` // Duração em aulas
    Order           int       `json:"order" gorm:"not null"` // Ordem na ementa
    IsActive        bool      `json:"isActive" gorm:"default:true"`
    
    CreatedAt       time.Time `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt       time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// CourseLessonPlan - Plano de aulas semanal (opcional)
type CourseLessonPlan struct {
    ID            uint      `json:"id" gorm:"primaryKey"`
    CourseClassID uint      `json:"courseClassId" gorm:"not null;index"`
    Name          string    `json:"name" gorm:"not null"` // "Plano 2026 - Semestre 1"
    Description   string    `json:"description"`
    IsActive      bool      `json:"isActive" gorm:"default:true"`
    CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt     time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
    
    // Associations
    Items []CourseLessonPlanItem `json:"items,omitempty"`
}

// CourseLessonPlanItem - Item do plano semanal
type CourseLessonPlanItem struct {
    ID               uint          `json:"id" gorm:"primaryKey"`
    LessonPlanID     uint          `json:"lessonPlanId" gorm:"not null;index"`
    SyllabusTopicID  uint          `json:"syllabusTopicId" gorm:"not null"`
    SyllabusTopic    SyllabusTopic `json:"syllabusTopic,omitempty"`
    WeekNumber       int           `json:"weekNumber" gorm:"not null"` // Semana 1, 2, 3...
    SessionNumber    int           `json:"sessionNumber" gorm:"not null"` // Aula 1 da semana
    Notes            string        `json:"notes"`
}
```

### 2.2 Casos de Uso

```
Cenário 1: Mesmo tema por várias aulas
├── SyllabusTopic: "Revisão de Verbos"
├── ClassSession 1: 01/03 - topic_id=1
├── ClassSession 2: 08/03 - topic_id=1 (mesmo tema)
└── ClassSession 3: 15/03 - topic_id=2 (novo tema)

Cenário 2: Aula especial
├── SyllabusTopic: "Gramática Básica"
├── ClassSession 1: 01/03 - topic_id=1
├── ClassSession 2: 08/03 - topic_override="Aula extra: Conversação" (especial)
└── ClassSession 3: 15/03 - topic_id=2

Cenário 3: Plano semanal aplicado
├── LessonPlan: "Plano Inglês 2026A"
├── Item 1: Semana 1, Aula 1 -> topic_id=1 (Apresentação)
├── Item 2: Semana 1, Aula 2 -> topic_id=2 (Verbos)
└── Botão "Aplicar Plano" preenche as ClassSessions futuras
```

---

## 👨‍🏫 3. SUBSTITUIÇÃO: TeacherSkill + Availability

### 3.1 Modelo

```go
// backend/internal/models/teacher.go

// Teacher (expandido)
type Teacher struct {
    ID             uint      `json:"id" gorm:"primaryKey"`
    UserID         uint      `json:"userId" gorm:"not null;uniqueIndex"`
    User           User      `json:"user,omitempty"`
    Specialization string    `json:"specialization"`
    Bio            string    `json:"bio"`
    Phone          string    `json:"phone"`
    Active         bool      `json:"active" gorm:"default:true"`
    CreatedAt      time.Time `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt      time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
    
    // Associations
    Skills       []TeacherSkill       `json:"skills,omitempty"`
    Availability []TeacherAvailability `json:"availability,omitempty"`
}

// Skill - Habilidade/tag (tabela global)
type Skill struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" gorm:"not null;unique"` // "Inglês", "Excel", "Conversação"
    Domain      string    `json:"domain"` // "Idiomas", "Tecnologia", "Artes"
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// TeacherSkill - N:N Teacher <-> Skill
type TeacherSkill struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    TeacherID uint      `json:"teacherId" gorm:"not null;index"`
    SkillID   uint      `json:"skillId" gorm:"not null;index"`
    Skill     Skill     `json:"skill,omitempty"`
    Level     string    `json:"level" gorm:"default:'intermediate'"` // beginner, intermediate, advanced
    CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// TeacherAvailability - Disponibilidade semanal
type TeacherAvailability struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    TeacherID uint      `json:"teacherId" gorm:"not null;index"`
    DayOfWeek int       `json:"dayOfWeek" gorm:"not null"` // 0=Domingo, 1=Segunda...
    StartTime string    `json:"startTime" gorm:"not null"` // "09:00"
    EndTime   string    `json:"endTime" gorm:"not null"`   // "18:00"
    IsActive  bool      `json:"isActive" gorm:"default:true"`
    CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TeacherAbsence - Registro de ausência do professor
type TeacherAbsence struct {
    ID          uint       `json:"id" gorm:"primaryKey"`
    TeacherID   uint       `json:"teacherId" gorm:"not null;index"`
    Teacher     Teacher    `json:"teacher,omitempty"`
    StartDate   time.Time  `json:"startDate" gorm:"not null"`
    EndDate     time.Time  `json:"endDate" gorm:"not null"`
    Reason      string     `json:"reason"`
    Status      string     `json:"status" gorm:"not null;default:'active'"` // active, resolved
    CreatedByID uint       `json:"createdById" gorm:"not null"`
    CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
}
```

### 3.2 Algoritmo de Busca de Substituto

```go
// backend/internal/service/teachers/substitute_service.go

func (s *service) FindSubstituteTeachers(
    ctx context.Context,
    sessionID uint,
) ([]SubstituteCandidate, error) {
    
    // 1. Buscar sessão e turma
    session, err := s.sessionRepo.GetByID(ctx, sessionID)
    if err != nil {
        return nil, err
    }
    
    courseClass := session.CourseClass
    course := courseClass.Course
    
    // 2. Buscar skills necessárias
    requiredSkills := s.skillRepo.GetByCourseID(ctx, course.ID)
    
    // 3. Buscar professores disponíveis
    candidates := []SubstituteCandidate{}
    
    teachers := s.teacherRepo.GetActiveTeachers(ctx)
    for _, teacher := range teachers {
        // Pular professor original
        if teacher.ID == courseClass.DefaultTeacherID {
            continue
        }
        
        // Verificar disponibilidade de horário
        if !s.isTeacherAvailable(teacher, session.Date, session.StartTime, session.EndTime) {
            continue
        }
        
        // Verificar skills
        skillMatch := s.calculateSkillMatch(teacher.Skills, requiredSkills)
        
        // Verificar conflito com outras aulas
        hasConflict := s.checkScheduleConflict(teacher.ID, session.Date, session.StartTime, session.EndTime)
        
        candidates = append(candidates, SubstituteCandidate{
            Teacher:     teacher,
            SkillMatch:  skillMatch,
            HasConflict: hasConflict,
            Score:       s.calculateScore(skillMatch, hasConflict),
        })
    }
    
    // Ordenar por score
    sort.Slice(candidates, func(i, j int) bool {
        return candidates[i].Score > candidates[j].Score
    })
    
    return candidates, nil
}

// Cálculo de score: mais skills + sem conflito = melhor
func (s *service) calculateScore(skillMatch float64, hasConflict bool) float64 {
    score := skillMatch * 100
    if hasConflict {
        score -= 50 // Penalidade por conflito
    }
    return score
}
```

### 3.3 Fluxo de Substituição

```
Professor Ana não pode dar aula:
│
├─► Admin registra ausência em /admin/teacher-absences
│   ├── TeacherID: Ana
│   ├── Período: 20/02 a 22/02
│   └── Motivo: "Atestado médico"
│
├─► Sistema identifica aulas afetadas
│   └── ClassSession 20/02, 21/02, 22/02
│
├─► Para cada aula, admin clica "Buscar Substituto"
│   └── Sistema retorna lista ordenada:
│       1. Prof. Carlos (95% match, disponível)
│       2. Prof. Maria (80% match, disponível)
│       3. Prof. João (70% match, conflito 10:00)
│
├─► Admin seleciona Prof. Carlos
│   └── Sistema atualiza ClassSession.TeacherID = Carlos
│       (override do professor)
│
└─► Prof. Carlos recebe notificação
    └── Vê aula no Portal do Professor (substituição)
```

---

## 🔄 Estratégia de Migração

### Fase 1: Criar Novas Tabelas (Sem Quebrar)

```sql
-- 1. Criar course_categories
CREATE TABLE course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar course_classes (turmas)
CREATE TABLE course_classes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    code VARCHAR(20) NOT NULL, -- "2026A"
    name VARCHAR(200),
    week_days VARCHAR(20) NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    default_location_id INTEGER REFERENCES locations(id),
    default_teacher_id INTEGER REFERENCES teachers(id),
    capacity INTEGER DEFAULT 30,
    max_students INTEGER NOT NULL,
    google_classroom_url VARCHAR(500),
    google_classroom_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, code)
);

-- 3. Criar syllabus_topics
CREATE TABLE syllabus_topics (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    objectives TEXT,
    resources JSONB,
    estimated_sessions INTEGER DEFAULT 1,
    "order" INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar skills
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar teacher_skills
CREATE TABLE teacher_skills (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    skill_id INTEGER NOT NULL REFERENCES skills(id),
    level VARCHAR(20) DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, skill_id)
);

-- 6. Criar teacher_availability
CREATE TABLE teacher_availability (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    day_of_week INTEGER NOT NULL, -- 0=Dom, 1=Seg...
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fase 2: Migrar Dados Existentes

```go
// migration_script.go

func MigrateCoursesToClasses(db *gorm.DB) error {
    return db.Transaction(func(tx *gorm.DB) error {
        // Para cada curso existente, criar uma turma padrão
        var courses []models.Course
        if err := tx.Find(&courses).Error; err != nil {
            return err
        }
        
        for _, course := range courses {
            // Criar turma padrão com dados do curso
            class := models.CourseClass{
                CourseID:          course.ID,
                Code:              "2026A", // ou gerar automaticamente
                Name:              course.Name + " - Turma A",
                WeekDays:          course.WeekDays,
                StartTime:         course.StartTime,
                EndTime:           course.EndTime,
                StartDate:         course.StartDate,
                EndDate:           course.EndDate,
                MaxStudents:       course.MaxStudents,
                GoogleClassroomURL: course.GoogleClassroomURL,
                GoogleClassroomID:  course.GoogleClassroomID,
                Status:            course.Status,
            }
            
            if err := tx.Create(&class).Error; err != nil {
                return err
            }
            
            // Migrar ClassSessions
            if err := tx.Model(&models.ClassSession{}).
                Where("course_id = ?", course.ID).
                Update("course_class_id", class.ID).Error; err != nil {
                return err
            }
            
            // Migrar Enrollments
            if err := tx.Model(&models.Enrollment{}).
                Where("course_id = ?", course.ID).
                Update("course_class_id", class.ID).Error; err != nil {
                return err
            }
        }
        
        return nil
    })
}
```

### Fase 3: Atualizar Código (Backward Compatible)

```go
// No handler, aceitar tanto course_id quanto course_class_id
type CreateEnrollmentRequest struct {
    StudentID     uint `json:"studentId" binding:"required"`
    CourseClassID uint `json:"courseClassId"` // Novo (preferencial)
    CourseID      uint `json:"courseId"`      // Legado (deprecated)
}

func (h *Handler) CreateEnrollment(c *gin.Context) {
    var req CreateEnrollmentRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // Compatibilidade: se não recebeu course_class_id, buscar turma padrão
    if req.CourseClassID == 0 && req.CourseID != 0 {
        class, err := h.service.GetDefaultClassForCourse(req.CourseID)
        if err != nil {
            c.JSON(400, gin.H{"error": "course_id deprecated, use course_class_id"})
            return
        }
        req.CourseClassID = class.ID
    }
    
    // ... continuar com CourseClassID
}
```

### Fase 4: Limpeza (Futuro)

```sql
-- Após todo sistema migrado e testado:
-- 1. Remover colunas deprecated
ALTER TABLE class_sessions DROP COLUMN course_id;
ALTER TABLE enrollments DROP COLUMN course_id;

-- 2. Mover dados de Course para CourseClass
-- (schedule, week_days, etc. já estão na turma)
```

---

## 📊 Impacto no Sistema Atual

### O que MUDA

| Componente | Mudança | Esforço |
|------------|---------|---------|
| **Models** | +5 tabelas, 3 modificadas | 4h |
| **Migrations** | Script de migração de dados | 6h |
| **APIs** | CRUD CourseClass, endpoints substituição | 8h |
| **Teacher Portal** | Listar turmas (não cursos) | 4h |
| **Matrícula** | Selecionar turma A/B/C | 2h |
| **Presença** | ClassSession aponta para turma | 2h |

### O que NÃO MUDA

- Portal do Professor (só ajustar queries)
- Lógica de presença (só FK muda)
- Autenticação/Autorização
- Integração Google Classroom

### Estimativa Total

| Fase | Tempo | Descrição |
|------|-------|-----------|
| 1 | 12h | Models + Migrations |
| 2 | 16h | Backend (CRUDs + Lógica) |
| 3 | 12h | Frontend (Ajustes) |
| 4 | 8h | Testes + Correções |
| **Total** | **48h (~6 dias)** | |

---

## ✅ Checklist de Implementação

### Semana 1: Fundação
- [ ] Criar tabelas novas (categories, course_classes, syllabus_topics, skills, availability)
- [ ] Modificar ClassSession (add course_class_id, syllabus_topic_id, teacher_id)
- [ ] Modificar Enrollment (add course_class_id)
- [ ] Script de migração de dados
- [ ] Testar migração em ambiente de dev

### Semana 2: Backend
- [ ] CRUD CourseClass
- [ ] CRUD SyllabusTopic
- [ ] CRUD Skills
- [ ] CRUD TeacherAvailability
- [ ] Serviço de busca de substituto
- [ ] Ajustar Teacher Portal para usar CourseClass

### Semana 3: Frontend
- [ ] Tela de listagem de Turmas (por Curso)
- [ ] Tela de criação de Turma A/B/C
- [ ] Matrícula: selecionar turma específica
- [ ] Admin: tela de skills do professor
- [ ] Admin: tela de disponibilidade
- [ ] Admin: tela de substituição

### Semana 4: Testes
- [ ] Teste: Curso com 3 turmas (A, B, C)
- [ ] Teste: Ementa com 2 aulas do mesmo tema
- [ ] Teste: Substituição de professor
- [ ] Teste: Migração de dados existentes

---

## 🎯 Resumo das Decisões

| Decisão | Justificativa |
|---------|---------------|
| **Turma obrigatória** | Course sem Turma não existe mais; toda matrícula é em uma turma |
| **Curso mantém ementa** | SyllabusTopic é do Course (template), não da turma |
| **Professor padrão na Turma** | DefaultTeacherID em CourseClass, override em ClassSession |
| **Skills N:N** | Professor pode ter múltiplas skills (ex: Inglês + Espanhol) |
| **Disponibilidade semanal** | Suficiente para substituição; não precisa de calendário completo |
| **Migração gradual** | Manter course_id nas tabelas durante transição |

---

**Documento criado em:** 21/02/2026  
**Status:** Pronto para implementação  
**Prioridade:** Alta (bloqueia escala para múltiplas turmas)
