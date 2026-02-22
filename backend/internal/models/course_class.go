// backend/internal/models/course_class.go
package models

import (
	"time"
)

// CourseClass (Turma) - Instância concreta de um curso
// Ex: "Inglês Básico - Turma 2026A (Sáb 09-11, Prof Ana, Sala 3)"
type CourseClass struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	CourseID  uint       `json:"courseId" gorm:"not null;index"`
	Course    Course     `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Code      string     `json:"code" gorm:"not null"` // "2026A", "2026B"
	Name      string     `json:"name"` // "Inglês Básico - Turma A"

	// Configuração de horário (padrão da turma)
	WeekDays  string     `json:"weekDays" gorm:"not null"`  // "1,3,5" = Seg/Qua/Sex
	StartTime string     `json:"startTime" gorm:"not null"` // "09:00"
	EndTime   string     `json:"endTime" gorm:"not null"`   // "11:00"
	StartDate time.Time  `json:"startDate" gorm:"not null"`
	EndDate   time.Time  `json:"endDate" gorm:"not null"`

	// Configuração de sala e professor (padrão)
	DefaultLocationID *uint      `json:"defaultLocationId" gorm:"index"`
	DefaultLocation   *Location  `json:"defaultLocation,omitempty" gorm:"foreignKey:DefaultLocationID"`
	DefaultTeacherID  *uint      `json:"defaultTeacherId" gorm:"index"`
	DefaultTeacher    *Teacher   `json:"defaultTeacher,omitempty" gorm:"foreignKey:DefaultTeacherID"`

	// Capacidade
	Capacity    int `json:"capacity" gorm:"not null;default:30"`
	MaxStudents int `json:"maxStudents" gorm:"not null"`

	// Google Classroom
	GoogleClassroomURL string `json:"googleClassroomUrl"`
	GoogleClassroomID  string `json:"googleClassroomId"`

	// Status: active, completed, cancelled
	Status    string     `json:"status" gorm:"not null;default:'active'"`
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`

	// Associations
	ClassSessions []ClassSession `json:"classSessions,omitempty" gorm:"foreignKey:CourseClassID"`
}

// TableName retorna o nome da tabela
func (CourseClass) TableName() string {
	return "course_classes"
}

// CourseCategory - Categorização de cursos (Tecnologia, Artes, Idiomas...)
type CourseCategory struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null;unique"` // "Idiomas", "Tecnologia"
	Description string    `json:"description"`
	Color       string    `json:"color"` // Hex para UI (#FF5733)
	Icon        string    `json:"icon"`  // Nome do ícone Material
	Order       int       `json:"order"` // Ordem de exibição
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (CourseCategory) TableName() string {
	return "course_categories"
}

// EnrollmentCourseClass - Tabela pivô N:N entre Enrollment e CourseClass
// Durante a transição, matrículas podem estar em Course (legado) OU CourseClass (novo)
type EnrollmentCourseClass struct {
	ID              uint        `json:"id" gorm:"primaryKey"`
	EnrollmentID    uint        `json:"enrollmentId" gorm:"not null;index"`
	Enrollment      Enrollment  `json:"enrollment,omitempty" gorm:"foreignKey:EnrollmentID"`
	CourseClassID   uint        `json:"courseClassId" gorm:"not null;index"`
	CourseClass     CourseClass `json:"courseClass,omitempty" gorm:"foreignKey:CourseClassID"`
	IsPrimary       bool        `json:"isPrimary" gorm:"default:true"` // É a turma principal?
	TransferredFrom *uint       `json:"transferredFrom,omitempty"`       // Se veio de outra turma
	Notes           string      `json:"notes"`
	CreatedAt       time.Time   `json:"createdAt" gorm:"autoCreateTime"`
}

// TableName retorna o nome da tabela
func (EnrollmentCourseClass) TableName() string {
	return "enrollment_course_classes"
}

// SyllabusTopic - Item de ementa reutilizável
type SyllabusTopic struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	CourseID          uint      `json:"courseId" gorm:"not null;index"`
	Course            Course    `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Title             string    `json:"title" gorm:"not null"` // "Apresentação Pessoal"
	Description       string    `json:"description" gorm:"type:text"`
	Content           string    `json:"content" gorm:"type:text"`      // Conteúdo detalhado
	Objectives        string    `json:"objectives" gorm:"type:text"`   // O que o aluno vai aprender
	Resources         string    `json:"resources" gorm:"type:json"`    // Links, PDFs, materiais
	EstimatedSessions int       `json:"estimatedSessions" gorm:"default:1"` // Duração em aulas
	Order             int       `json:"order" gorm:"not null"`         // Ordem na ementa
	IsActive          bool      `json:"isActive" gorm:"default:true"`
	CreatedAt         time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (SyllabusTopic) TableName() string {
	return "syllabus_topics"
}
