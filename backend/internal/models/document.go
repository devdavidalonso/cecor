// models/document.go
package models

import (
	"time"
)

// Document representa um documento digitalizado no sistema
type Document struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	StudentID  uint      `json:"student_id" gorm:"column:student_id;not null"`
	Name       string    `json:"name" gorm:"column:name;not null"`
	Type       string    `json:"type" gorm:"column:type;not null"`
	Path       string    `json:"path" gorm:"column:path;not null"`
	UploadedBy uint      `json:"uploaded_by" gorm:"column:uploaded_by;not null"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Relacionamentos
	Student  Student `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	Uploader User    `json:"uploader,omitempty" gorm:"foreignKey:UploadedBy"`
}

// TableName especifica o nome da tabela no banco de dados
func (Document) TableName() string {
	return "documents"
}
