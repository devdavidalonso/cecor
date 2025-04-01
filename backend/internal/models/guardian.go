package models

import (
	"time"
)

// Guardian represents a student's guardian
type Guardian struct {
	ID                   uint       `json:"id" gorm:"primaryKey"`
	StudentID            uint       `json:"studentId" gorm:"not null;index"`
	Name                 string     `json:"name" gorm:"not null"`
	Email                string     `json:"email"`
	Phone                string     `json:"phone"`
	CPF                  string     `json:"cpf"`
	Relationship         string     `json:"relationship" gorm:"not null"`
	CanPickup            bool       `json:"canPickup" gorm:"default:false"`
	ReceiveNotifications bool       `json:"receiveNotifications" gorm:"default:true"`
	AuthorizeActivities  bool       `json:"authorizeActivities" gorm:"default:false"`
	UserID               *uint      `json:"userId"` // Optional link to a User account
	CreatedAt            time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt            time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt            *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName specifies the database table name
func (Guardian) TableName() string {
	return "guardians"
}

// GuardianPermissions represents permissions granted to a guardian
type GuardianPermissions struct {
	ID                   uint     `json:"id" gorm:"primaryKey"`
	GuardianID           uint     `json:"guardianId" gorm:"not null;index"`
	PickupStudent        bool     `json:"pickupStudent" gorm:"default:false"`
	ReceiveNotifications bool     `json:"receiveNotifications" gorm:"default:true"`
	AuthorizeActivities  bool     `json:"authorizeActivities" gorm:"default:false"`
	Guardian             Guardian `json:"guardian" gorm:"foreignKey:GuardianID"`
}

// TableName specifies the database table name
func (GuardianPermissions) TableName() string {
	return "guardian_permissions"
}
