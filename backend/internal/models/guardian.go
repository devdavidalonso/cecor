// internal/models/guardian.go

package models

import (
	"time"
)

// Guardian represents a student's guardian or responsible person
type Guardian struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	StudentID           uint      `json:"student_id" gorm:"not null"`
	Name                string    `json:"name" gorm:"size:100;not null"`
	CPF                 string    `json:"cpf" gorm:"size:14"`
	Email               string    `json:"email" gorm:"size:100"`
	Phone               string    `json:"phone" gorm:"size:20"`
	Relationship        string    `json:"relationship" gorm:"size:50;not null"`
	ContactPriority     int       `json:"contact_priority" gorm:"not null;default:3"` // 1, 2 or 3
	// Permissions
	PermPickup          bool      `json:"perm_pickup" gorm:"default:false"`
	PermNotifications   bool      `json:"perm_notifications" gorm:"default:true"`
	PermActivities      bool      `json:"perm_activities" gorm:"default:false"`
	PermMeetings        bool      `json:"perm_meetings" gorm:"default:true"`
	PermFinancial       bool      `json:"perm_financial" gorm:"default:false"`
	PermDocuments       bool      `json:"perm_documents" gorm:"default:true"`
	PermEmergency       bool      `json:"perm_emergency" gorm:"default:false"`
	PermPortalAccess    bool      `json:"perm_portal_access" gorm:"default:true"`
	Status              string    `json:"status" gorm:"size:20;default:'active'"` // 'active', 'inactive'
	CreatedAt           time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	
	// Relationships
	Student             User      `json:"student,omitempty" gorm:"foreignKey:StudentID"`
}

// TableName specifies the database table name
func (Guardian) TableName() string {
	return "guardians"
}