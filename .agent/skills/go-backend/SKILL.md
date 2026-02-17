---
name: go-backend
description: Padrões técnicos e arquitetura do Backend (Go) no projeto CECOR
---

# Go Backend Skill - CECOR

Este guia define os padrões de desenvolvimento para o backend em Go, focado em manutenibilidade e resiliência.

---

## 🌍 Convenção de Nomenclatura (IMPORTANTE)

### Código (Go) - 100% Inglês

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Packages | lowercase + inglês | `service/teachers`, `service/enrollments` |
| Structs | PascalCase + inglês | `Course`, `Student`, `Teacher` |
| Interfaces | PascalCase + inglês | `CourseRepository`, `EnrollmentService` |
| Funções | PascalCase/camelCase + inglês | `GetCourses()`, `createStudent()` |
| Variáveis | camelCase + inglês | `courseList`, `isActive` |
| Constantes | PascalCase + inglês | `MaxPageSize`, `DefaultTimeout` |

### Arquivos e Pastas

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Packages | singular/plural em inglês | `service/courses/`, `models/student.go` |
| Arquivos | snake_case + inglês | `course_service.go`, `enrollment_handler.go` |
| Testes | sufixo `_test.go` | `course_service_test.go` |

### API Endpoints

| Convenção | Exemplo |
|-----------|---------|
| Recursos em inglês | `/api/courses`, `/api/students` |
| Ações específicas | `/api/enrollments/:id/confirm` |
| Query params | `/api/courses?status=active` |

**⚠️ NUNCA use português em endpoints ou nomes de packages!**

```go
// ✅ CORRETO
package teachers

func (s *Service) GetTeachers() ([]Teacher, error)
func (s *Service) CreateTeacher(t *Teacher) error

// Handler
router.Get("/api/teachers", handler.GetAll)
router.Post("/api/teachers", handler.Create)

// ❌ INCORRETO
package professores  // Português

func (s *Service) GetProfessores()  // Português
func (s *Service) CriarProfessor()  // Português

// Handler
router.Get("/api/professores", handler.GetAll)  // Português
```

---

## 1. Arquitetura Hexagonal

O projeto segue uma estrutura de camadas:

- `cmd/api`: Ponto de entrada da aplicação.
- `internal/models`: Definição de entidades e structs (em inglês).
- `internal/repository`: Interface e implementação de acesso a dados (PostgreSQL/GORM).
- `internal/service`: Lógica de negócio e orquestração.
- `internal/api/handlers`: Manipulação de requisições HTTP.

### Estrutura de Packages

```
internal/
├── service/
│   ├── attendance/          # Presenças
│   ├── courses/             # Cursos
│   ├── email/               # Email (singleton)
│   ├── enrollments/         # Matrículas
│   ├── keycloak/            # Keycloak (singleton)
│   ├── reports/             # Relatórios
│   ├── students/            # Alunos
│   ├── teachers/            # Professores
│   └── users/               # Usuários
├── models/
│   ├── course.go
│   ├── student.go
│   └── teacher.go
└── api/handlers/
    ├── attendance_handler.go
    ├── course_handler.go
    └── teacher_handler.go
```

---

## 2. Padrões de GORM e Modelos

### Structs em Inglês

```go
// ✅ CORRETO - Tudo em inglês
package models

type Course struct {
    ID                  uint           `gorm:"primaryKey" json:"id"`
    Name                string         `gorm:"size:255;not null" json:"name"`
    ShortDescription    string         `gorm:"size:500" json:"short_description,omitempty"`
    DetailedDescription string         `gorm:"type:text" json:"detailed_description,omitempty"`
    Workload            int            `gorm:"not null" json:"workload"`
    MaxStudents         int            `gorm:"not null" json:"max_students"`
    Status              string         `gorm:"size:20;default:'active'" json:"status"`
    TeacherID           *uint          `json:"teacher_id,omitempty"`
    Teacher             *Teacher       `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
    CreatedAt           time.Time      `json:"created_at"`
    UpdatedAt           time.Time      `json:"updated_at"`
    DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

type Teacher struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:255;not null" json:"name"`
    Email     string    `gorm:"size:255;unique;not null" json:"email"`
    CPF       string    `gorm:"size:14;unique" json:"cpf,omitempty"`
    Phone     *string   `gorm:"size:20" json:"phone,omitempty"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// ❌ INCORRETO - Português
 type Curso struct {           // Português
     Nome             string  // Português
     CargaHoraria     int     // Português
     NumeroMaxAlunos  int     // Português
 }
```

### Boas Práticas

- **Ponteiros para Opcionais**: Sempre use ponteiros (`*string`, `*int`) para campos que podem ser nulos no banco de dados. Isso evita que strings vazias causem violações de `NOT NULL`.
- **JSON Tags**: Use `json:"field_name,omitempty"` para campos que não devem ser enviados se estiverem vazios.
- **Soft Delete**: Utilize `gorm.DeletedAt` para permitir a recuperação de dados e manter a integridade referencial.

---

## 3. Integração e Serviços Externos

- **Keycloak**: O `KeycloakService` deve ser chamado pelos serviços de domínio (ex: `StudentService`). Trate falhas no Keycloak como alertas (`Warning`), não impedindo o salvamento no banco local (falha suave), a menos que seja um fluxo crítico de segurança.
- **Tratamento de Erros**: Erros de banco de dados (Unique Constraint, Foreign Key) devem ser mapeados para mensagens de erro HTTP amigáveis (409 Conflict, 400 Bad Request).

---

## 4. Banco de Dados

- Novas tabelas ou alterações de schema devem ser refletidas em `backend/scripts/postgres-init/migrations/`.
- Siga a convenção de nomes em snake_case para colunas e tabelas em inglês.

### Convenções de Nomenclatura (Database)

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabelas | snake_case + inglês | `courses`, `enrollments`, `attendance_records` |
| Colunas | snake_case + inglês | `first_name`, `workload`, `max_students` |
| Foreign Keys | snake_case + `_id` | `teacher_id`, `course_id` |
| Índices | `idx_` + tabela + coluna | `idx_courses_teacher_id` |

```sql
-- ✅ CORRETO
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_description VARCHAR(500),
    workload INTEGER NOT NULL,
    max_students INTEGER NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ INCORRETO
CREATE TABLE cursos (              -- Português
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,    -- Português
    carga_horaria INTEGER,         -- Português
    professor_id INTEGER           -- Português
);
```

---

## 5. Criando Novos Services

### Checklist

Ao criar um novo service, verifique:

- [ ] **Nome do package** em inglês: `service/enrollments/`
- [ ] **Nome do arquivo** em inglês: `enrollment_service.go`
- [ ] **Structs** em inglês: `Enrollment`, `EnrollmentService`
- [ ] **Métodos** em inglês: `GetEnrollments()`, `CreateEnrollment()`
- [ ] **Models** atualizados com nomes em inglês
- [ ] **Handler** com rotas em inglês: `/api/enrollments`
- [ ] **Migração** criada para tabelas em inglês

### Exemplo Completo

```go
// internal/service/enrollments/enrollment_service.go
package enrollments

import (
    "context"
    "github.com/cecor/backend/internal/models"
    "gorm.io/gorm"
)

type Service struct {
    db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
    return &Service{db: db}
}

func (s *Service) GetEnrollments(ctx context.Context) ([]models.Enrollment, error) {
    var enrollments []models.Enrollment
    result := s.db.WithContext(ctx).Find(&enrollments)
    return enrollments, result.Error
}

func (s *Service) CreateEnrollment(ctx context.Context, enrollment *models.Enrollment) error {
    return s.db.WithContext(ctx).Create(enrollment).Error
}
```

```go
// internal/models/enrollment.go
package models

type Enrollment struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    StudentID uint      `gorm:"not null" json:"student_id"`
    CourseID  uint      `gorm:"not null" json:"course_id"`
    Status    string    `gorm:"size:20;default:'pending'" json:"status"`
    CreatedAt time.Time `json:"created_at"`
}
```

---

## 📚 Referências

- [Documentação de Migração](../../MIGRATION_PHASE1_REPORT.md)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [GORM Documentation](https://gorm.io/docs/)
- [Effective Go](https://go.dev/doc/effective_go)
