package models

import (
	"time"

	"gorm.io/gorm"
)

// UserContact represents an emergency contact or guardian for a user/student
type UserContact struct {
	ID                   uint           `json:"id" gorm:"primaryKey"`
	UserID               *uint          `json:"userId" gorm:"index"`    // Nullable FK to users
	StudentID            *uint          `json:"studentId" gorm:"index"` // Nullable FK to students
	Name                 string         `json:"name" gorm:"not null"`
	Email                string         `json:"email"`
	Phone                string         `json:"phone"`
	CPF                  string         `json:"cpf"`
	Relationship         string         `json:"relationship" gorm:"not null"` // e.g., "Mother", "Spouse", "Friend"
	CanPickup            bool           `json:"canPickup" gorm:"default:false"`
	ReceiveNotifications bool           `json:"receiveNotifications" gorm:"default:false"`
	AuthorizeActivities  bool           `json:"authorizeActivities" gorm:"default:false"`
	CreatedAt            time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt            time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt            gorm.DeletedAt `json:"deletedAt" gorm:"index"`
}

// TableName defines the table name in the database
func (UserContact) TableName() string {
	return "user_contacts"
}
