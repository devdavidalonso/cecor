package models

import (
	"time"
)

// AuditLog represents an audit log entry for changes in the system
type AuditLog struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	EntityType string    `json:"entityType" gorm:"not null"`
	EntityID   uint      `json:"entityId" gorm:"not null"`
	Action     string    `json:"action" gorm:"not null"` // Create, Update, Delete
	UserID     uint      `json:"userId" gorm:"not null"`
	OldData    string    `json:"oldData" gorm:"type:jsonb"`
	NewData    string    `json:"newData" gorm:"type:jsonb"`
	CreatedAt  time.Time `json:"createdAt" gorm:"autoCreateTime"`
	User       User      `json:"user" gorm:"foreignKey:UserID"`
}

// TableName specifies the database table name
func (AuditLog) TableName() string {
	return "audit_logs"
}
