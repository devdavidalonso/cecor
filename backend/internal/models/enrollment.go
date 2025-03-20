// models/enrollment.go
package models

import (
	"time"
)

// Enrollment representa uma matrícula de um aluno em um curso
type Enrollment struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	UserID    uint       `json:"user_id" gorm:"index;not null"`
	CourseID  uint       `json:"course_id" gorm:"index;not null"`
	Status    string     `json:"status" gorm:"size:20;not null"` // 'ativa', 'concluida', 'cancelada'
	StartDate time.Time  `json:"start_date" gorm:"not null"`
	EndDate   *time.Time `json:"end_date,omitempty"`
	CreatedAt time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	// Relações
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Course Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// TableName especifica o nome da tabela no banco de dados
func (Enrollment) TableName() string {
	return "enrollments"
}
