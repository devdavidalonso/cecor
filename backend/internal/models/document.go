package models

import (
	"time"
)

// Document represents a document uploaded for a student
type Document struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	StudentID    uint      `json:"studentId" gorm:"not null;index"`
	Name         string    `json:"name" gorm:"not null"`
	Type         string    `json:"type" gorm:"not null"`
	Path         string    `json:"path" gorm:"not null"`
	UploadedByID uint      `json:"uploadedById" gorm:"not null"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (Document) TableName() string {
	return "documents"
}
