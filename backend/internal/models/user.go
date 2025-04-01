package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	Name            string     `json:"name" gorm:"not null"`
	Email           string     `json:"email" gorm:"not null;unique"`
	Password        string     `json:"-" gorm:"not null"`       // Not exposed in JSON
	Profile         string     `json:"profile" gorm:"not null"` // admin, manager, teacher, student, guardian
	CPF             string     `json:"cpf" gorm:"unique"`
	BirthDate       time.Time  `json:"birthDate"`
	Phone           string     `json:"phone"`
	Address         string     `json:"address"`
	PhotoURL        string     `json:"photoUrl"`
	Active          bool       `json:"active" gorm:"default:true"`
	LastLogin       *time.Time `json:"lastLogin"`
	ResetToken      string     `json:"-"`
	TokenExpiration *time.Time `json:"-"`
	CreatedAt       time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt       time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt       *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName defines the table name in the database
func (User) TableName() string {
	return "users"
}

// CalculateAge calculates the user's age based on birth date
func (u *User) CalculateAge() int {
	now := time.Now()
	years := now.Year() - u.BirthDate.Year()

	// Adjust age if birthday hasn't occurred yet this year
	birthDateThisYear := time.Date(now.Year(), u.BirthDate.Month(), u.BirthDate.Day(), 0, 0, 0, 0, time.UTC)
	if now.Before(birthDateThisYear) {
		years--
	}

	return years
}

// Permission represents a permission in the system
type Permission struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null;unique"`
	Code        string    `json:"code" gorm:"not null;unique"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (Permission) TableName() string {
	return "permissions"
}

// ProfilePermission represents the association between profiles and permissions
type ProfilePermission struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	ProfileType  string    `json:"profileType" gorm:"not null;index"`
	PermissionID uint      `json:"permissionId" gorm:"not null;index"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// TableName defines the table name in the database
func (ProfilePermission) TableName() string {
	return "profile_permissions"
}

// AccessLog represents a record of system access
type AccessLog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"userId" gorm:"index"`
	Timestamp time.Time `json:"timestamp" gorm:"not null"`
	IPAddress string    `json:"ipAddress"`
	UserAgent string    `json:"userAgent"`
	Action    string    `json:"action" gorm:"not null"` // Login, Logout, Failed
	Details   string    `json:"details"`
}

// TableName defines the table name in the database
func (AccessLog) TableName() string {
	return "access_logs"
}
