// internal/models/notification.go
package models

import (
	"time"
)

// Notification representa uma notificação do sistema
type Notification struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	UserID          uint       `json:"user_id" gorm:"not null"`
	Title           string     `json:"title" gorm:"size:100;not null"`
	Message         string     `json:"message" gorm:"type:text;not null"`
	Type            string     `json:"type" gorm:"size:30;not null"` // 'absence', 'event', 'system', etc.
	EntityType      string     `json:"entity_type" gorm:"size:30"`   // 'student', 'course', 'enrollment', etc.
	EntityID        *uint      `json:"entity_id"`
	DeliveryStatus  string     `json:"delivery_status" gorm:"size:20;default:pending"` // 'pending', 'delivered', 'failed'
	DeliveryAttempt int        `json:"delivery_attempt" gorm:"default:0"`
	LastAttemptAt   *time.Time `json:"last_attempt_at"`
	DeliveredAt     *time.Time `json:"delivered_at"`
	ReadAt          *time.Time `json:"read_at"`
	ErrorMessage    string     `json:"error_message" gorm:"type:text"`
	CreatedAt       time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// Relações
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// TableName especifica o nome da tabela no banco de dados
func (Notification) TableName() string {
	return "notifications"
}
