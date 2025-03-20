// models/student.go
package models

import (
	"time"
)

// Student representa um aluno no sistema
type Student struct {
	ID                 uint          `json:"id" gorm:"primaryKey"`
	UserID             uint          `json:"user_id" gorm:"column:user_id;not null"`
	User               User          `json:"user" gorm:"foreignKey:UserID"`
	RegistrationNumber string        `json:"registration_number" gorm:"column:registration_number;not null"`
	Status             string        `json:"status" gorm:"column:status;not null"`
	CreatedAt          time.Time     `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt          time.Time     `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt          *time.Time    `json:"deleted_at,omitempty" gorm:"index"`
	Guardians          []Guardian    `json:"guardians,omitempty" gorm:"foreignKey:StudentID"`
	Documents          []Document    `json:"documents,omitempty" gorm:"foreignKey:StudentID"`
	Notes              []StudentNote `json:"notes,omitempty" gorm:"foreignKey:StudentID"`
}

// StudentNote representa uma anotação sobre um aluno
type StudentNote struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	StudentID      uint      `json:"student_id" gorm:"column:student_id;not null"`
	AuthorID       uint      `json:"author_id" gorm:"column:author_id;not null"`
	Content        string    `json:"content" gorm:"column:content;type:text;not null"`
	IsConfidential bool      `json:"is_confidential" gorm:"column:is_confidential;default:false"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName especifica o nome da tabela no banco de dados
func (Student) TableName() string {
	return "students"
}

func (StudentNote) TableName() string {
	return "student_notes"
}
