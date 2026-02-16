package models

import (
	"time"
)

// UserProfile represents a profile catalog (admin, professor, student)
type UserProfile struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:50;not null;uniqueIndex"` // admin, professor, student
	Description string    `json:"description" gorm:"size:255"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName specifies the database table name
func (UserProfile) TableName() string {
	return "user_profiles"
}
