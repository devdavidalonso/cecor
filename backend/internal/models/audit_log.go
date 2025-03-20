// models/audit_log.go
package models

import (
	"time"
)

// AuditLog representa um registro de auditoria para rastreamento de alterações
type AuditLog struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	EntityType string    `json:"entity_type" gorm:"column:entity_type;not null"`
	EntityID   uint      `json:"entity_id" gorm:"column:entity_id;not null"`
	Action     string    `json:"action" gorm:"column:action;not null"`
	UserID     uint      `json:"user_id" gorm:"column:user_id;not null"`
	OldData    string    `json:"old_data" gorm:"column:old_data;type:json"`
	NewData    string    `json:"new_data" gorm:"column:new_data;type:json"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`

	// Relacionamentos
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName especifica o nome da tabela no banco de dados
func (AuditLog) TableName() string {
	return "audit_logs"
}
