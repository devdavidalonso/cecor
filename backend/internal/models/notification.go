// models/notification.go
package models

import (
	"time"
)

// Notification representa uma notificação enviada pelo sistema
type Notification struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	UserID       uint       `json:"user_id" gorm:"not null;index"`
	Title        string     `json:"title" gorm:"size:100;not null"`
	Content      string     `json:"content" gorm:"type:text;not null"`
	Type         string     `json:"type" gorm:"size:30;not null"`                     // 'absence', 'event', 'system', etc.
	Channel      string     `json:"channel" gorm:"size:20;not null"`                  // 'email', 'sms', 'telegram', 'push', 'in-app'
	Status       string     `json:"status" gorm:"size:20;not null;default:'pending'"` // 'pending', 'sent', 'delivered', 'read', 'failed'
	SentAt       *time.Time `json:"sent_at"`
	DeliveredAt  *time.Time `json:"delivered_at"`
	ReadAt       *time.Time `json:"read_at"`
	ErrorMessage string     `json:"error_message" gorm:"type:text"`
	RelatedType  string     `json:"related_type" gorm:"size:30"` // 'absence', 'enrollment', 'course', etc.
	RelatedID    *uint      `json:"related_id"`
	CreatedAt    time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// Relacionamentos
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName especifica o nome da tabela no banco de dados
func (Notification) TableName() string {
	return "notifications"
}
