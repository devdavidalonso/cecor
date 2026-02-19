package models

import (
	"time"
)

// ClassSession represents a scheduled class/lesson for a course
type ClassSession struct {
	ID                 uint      `json:"id" gorm:"primaryKey"`
	CourseID           uint      `json:"courseId" gorm:"not null;index"`
	LocationID         *uint     `json:"locationId" gorm:"index"` // Nullable, as location might not be set
	Date               time.Time `json:"date" gorm:"not null"`
	Topic              string    `json:"topic"`
	IsCancelled        bool      `json:"isCancelled" gorm:"default:false"`
	CancellationReason string    `json:"cancellationReason"`
	CreatedAt          time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt          time.Time `json:"updatedAt" gorm:"autoUpdateTime"`

	// Associations - to be enabled if needed, avoiding circular deps
	// Course   Course   `json:"course,omitempty"`
	// Location Location `json:"location,omitempty"`
}

// TableName defines the table name in the database
func (ClassSession) TableName() string {
	return "class_sessions"
}
