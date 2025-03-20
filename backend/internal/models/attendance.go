// models/attendance.go
package models

import (
	"time"
)

// Attendance representa um registro de presença de um aluno em um curso
type Attendance struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	StudentID      uint      `json:"student_id" gorm:"not null"`
	CourseID       uint      `json:"course_id" gorm:"not null"`
	Date           time.Time `json:"date" gorm:"not null;index"`
	Status         string    `json:"status" gorm:"size:20;not null"` // 'present', 'absent', 'partial'
	Module         string    `json:"module" gorm:"size:50"`          // módulo específico da aula, se aplicável
	Justification  string    `json:"justification" gorm:"type:text"`
	HasAttachment  bool      `json:"has_attachment" gorm:"default:false"`
	AttachmentURL  string    `json:"attachment_url" gorm:"size:255"`
	Notes          string    `json:"notes" gorm:"type:text"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	RegisteredByID uint      `json:"registered_by_id" gorm:"not null"`

	// Relacionamentos
	Student      User   `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	Course       Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	RegisteredBy User   `json:"registered_by,omitempty" gorm:"foreignKey:RegisteredByID"`
}

// AbsenceJustification representa uma justificativa para faltas de alunos
type AbsenceJustification struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	StudentID     uint       `json:"student_id" gorm:"not null"`
	CourseID      uint       `json:"course_id" gorm:"not null"`
	StartDate     time.Time  `json:"start_date" gorm:"not null"`
	EndDate       time.Time  `json:"end_date" gorm:"not null"`
	Reason        string     `json:"reason" gorm:"type:text;not null"`
	DocumentURL   string     `json:"document_url" gorm:"size:255"`
	Status        string     `json:"status" gorm:"size:20;not null;default:'pending'"` // 'pending', 'approved', 'rejected'
	Notes         string     `json:"notes" gorm:"type:text"`
	SubmittedByID uint       `json:"submitted_by_id" gorm:"not null"`
	ReviewedByID  *uint      `json:"reviewed_by_id"`
	ReviewDate    *time.Time `json:"review_date"`
	CreatedAt     time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// Relacionamentos
	Student     User   `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	Course      Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	SubmittedBy User   `json:"submitted_by,omitempty" gorm:"foreignKey:SubmittedByID"`
	ReviewedBy  *User  `json:"reviewed_by,omitempty" gorm:"foreignKey:ReviewedByID"`
}

// AbsenceAlert representa um alerta gerado pelo sistema para faltas consecutivas
type AbsenceAlert struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	StudentID        uint       `json:"student_id" gorm:"not null"`
	CourseID         uint       `json:"course_id" gorm:"not null"`
	Level            int        `json:"level" gorm:"not null"` // 1, 2, 3, 4 (progressivo)
	AbsenceCount     int        `json:"absence_count" gorm:"not null"`
	FirstAbsenceDate time.Time  `json:"first_absence_date"`
	LastAbsenceDate  time.Time  `json:"last_absence_date"`
	Status           string     `json:"status" gorm:"size:20;not null;default:'open'"` // 'open', 'resolved'
	NotificationSent bool       `json:"notification_sent" gorm:"default:false"`
	NotificationDate *time.Time `json:"notification_date"`
	ResolvedByID     *uint      `json:"resolved_by_id"`
	ResolutionDate   *time.Time `json:"resolution_date"`
	ResolutionNotes  string     `json:"resolution_notes" gorm:"type:text"`
	CreatedAt        time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// Relacionamentos
	Student    User   `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	Course     Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	ResolvedBy *User  `json:"resolved_by,omitempty" gorm:"foreignKey:ResolvedByID"`
}

// TableName especifica o nome da tabela no banco de dados
func (Attendance) TableName() string {
	return "attendances"
}

func (AbsenceJustification) TableName() string {
	return "absence_justifications"
}

func (AbsenceAlert) TableName() string {
	return "absence_alerts"
}
