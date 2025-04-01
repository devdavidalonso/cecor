package models

import (
	"time"
)

// UserProfile represents a specific profile associated with a user
type UserProfile struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	UserID      uint       `json:"userId" gorm:"not null;index"`
	ProfileType string     `json:"profileType" gorm:"not null"` // admin, gestor, professor, aluno, responsavel
	IsPrimary   bool       `json:"isPrimary" gorm:"default:false"`
	IsActive    bool       `json:"isActive" gorm:"default:true"`
	ScopeType   string     `json:"scopeType"` // curso, departamento
	ScopeID     *uint      `json:"scopeId"`
	StartDate   time.Time  `json:"startDate" gorm:"not null"`
	EndDate     *time.Time `json:"endDate"`
	CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	User        User       `json:"user" gorm:"foreignKey:UserID"`
}

// TableName specifies the database table name
func (UserProfile) TableName() string {
	return "user_profiles"
}
