package models

import (
	"time"
)

// StudentNote represents a note or observation about a student
type StudentNote struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	StudentID      uint      `json:"studentId" gorm:"not null;index"`
	AuthorID       uint      `json:"authorId" gorm:"not null"`
	Content        string    `json:"content" gorm:"type:text;not null"`
	IsConfidential bool      `json:"isConfidential" gorm:"default:false"`
	CreatedAt      time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	Student        Student   `json:"student" gorm:"foreignKey:StudentID"`
	Author         User      `json:"author" gorm:"foreignKey:AuthorID"`
}

// TableName specifies the database table name
func (StudentNote) TableName() string {
	return "student_notes"
}
