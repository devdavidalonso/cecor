package models

import (
	"time"
)

// VolunteerTermTemplate represents a template for volunteer terms
type VolunteerTermTemplate struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Content     string    `json:"content" gorm:"type:text;not null"`
	Version     string    `json:"version" gorm:"not null"`
	IsActive    bool      `json:"isActive" gorm:"default:true"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedByID uint      `json:"createdById" gorm:"not null"`
	CreatedBy   User      `json:"createdBy" gorm:"foreignKey:CreatedByID"`
}

// TableName specifies the database table name
func (VolunteerTermTemplate) TableName() string {
	return "volunteer_term_templates"
}

// VolunteerTerm represents a signed volunteer term
type VolunteerTerm struct {
	ID             uint                   `json:"id" gorm:"primaryKey"`
	TeacherID      uint                   `json:"teacherId" gorm:"not null;index"`
	TemplateID     uint                   `json:"templateId" gorm:"not null"`
	SignedAt       time.Time              `json:"signedAt" gorm:"not null"`
	ExpirationDate time.Time              `json:"expirationDate" gorm:"not null"`
	IPAddress      string                 `json:"ipAddress"`
	DeviceInfo     string                 `json:"deviceInfo"`
	SignatureType  string                 `json:"signatureType" gorm:"not null;default:'digital'"`
	Status         string                 `json:"status" gorm:"not null;default:'active'"` // active, expired, revoked
	DocumentURL    string                 `json:"documentUrl"`
	ReminderSent   bool                   `json:"reminderSent" gorm:"default:false"`
	CreatedAt      time.Time              `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time              `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedByID    uint                   `json:"createdById" gorm:"not null"`
	Teacher        User                   `json:"teacher" gorm:"foreignKey:TeacherID"`
	Template       VolunteerTermTemplate  `json:"template" gorm:"foreignKey:TemplateID"`
	CreatedBy      User                   `json:"createdBy" gorm:"foreignKey:CreatedByID"`
	History        []VolunteerTermHistory `json:"history" gorm:"foreignKey:TermID"`
}

// TableName specifies the database table name
func (VolunteerTerm) TableName() string {
	return "volunteer_terms"
}

// VolunteerTermHistory represents the history of actions on a volunteer term
type VolunteerTermHistory struct {
	ID          uint          `json:"id" gorm:"primaryKey"`
	TermID      uint          `json:"termId" gorm:"not null;index"`
	ActionType  string        `json:"actionType" gorm:"not null"` // signed, viewed, expired, renewed
	ActionDate  time.Time     `json:"actionDate" gorm:"not null"`
	ActionByID  *uint         `json:"actionById"`
	Details     string        `json:"details"`
	CreatedByID uint          `json:"createdById" gorm:"not null"`
	Term        VolunteerTerm `json:"term" gorm:"foreignKey:TermID"`
	ActionBy    *User         `json:"actionBy" gorm:"foreignKey:ActionByID"`
	CreatedBy   User          `json:"createdBy" gorm:"foreignKey:CreatedByID"`
}

// TableName specifies the database table name
func (VolunteerTermHistory) TableName() string {
	return "volunteer_term_history"
}
