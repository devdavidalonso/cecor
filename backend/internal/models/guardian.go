// models/guardian.go
package models

import (
	"time"
)

// Guardian representa um responsável pelo aluno
type Guardian struct {
	ID           uint                `json:"id" gorm:"primaryKey"`
	StudentID    uint                `json:"student_id" gorm:"column:student_id;not null"`
	Name         string              `json:"name" gorm:"column:name;not null"`
	Email        string              `json:"email" gorm:"column:email"`
	Phone        string              `json:"phone" gorm:"column:phone"`
	CPF          string              `json:"cpf" gorm:"column:cpf"`
	Relationship string              `json:"relationship" gorm:"column:relationship"`
	CreatedAt    time.Time           `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time           `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt    *time.Time          `json:"deleted_at,omitempty" gorm:"index"`
	Permissions  GuardianPermissions `json:"permissions" gorm:"foreignKey:GuardianID"`
}

// GuardianPermissions representa as permissões de um responsável
type GuardianPermissions struct {
	ID                   uint `json:"id" gorm:"primaryKey"`
	GuardianID           uint `json:"guardian_id" gorm:"column:guardian_id;not null"`
	PickupStudent        bool `json:"pickup_student" gorm:"column:pickup_student;default:false"`
	ReceiveNotifications bool `json:"receive_notifications" gorm:"column:receive_notifications;default:true"`
	AuthorizeActivities  bool `json:"authorize_activities" gorm:"column:authorize_activities;default:false"`
}

// TableName especifica o nome da tabela no banco de dados
func (Guardian) TableName() string {
	return "guardians"
}

func (GuardianPermissions) TableName() string {
	return "guardian_permissions"
}
