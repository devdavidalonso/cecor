// models/volunteer_term.go
package models

import (
	"time"
)

// VolunteerTermTemplate representa um modelo para termos de voluntariado
type VolunteerTermTemplate struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"size:100;not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	Version   string    `json:"version" gorm:"size:20;not null"`
	IsActive  bool      `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy uint      `json:"created_by" gorm:"not null"`

	// Relacionamentos
	Creator User            `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	Terms   []VolunteerTerm `json:"terms,omitempty" gorm:"foreignKey:TemplateID"`
}

// VolunteerTerm representa um termo de voluntariado assinado
type VolunteerTerm struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	TeacherID      uint      `json:"teacher_id" gorm:"not null"`
	TemplateID     uint      `json:"template_id" gorm:"not null"`
	SignedAt       time.Time `json:"signed_at" gorm:"not null"`
	ExpirationDate time.Time `json:"expiration_date" gorm:"not null"`
	IPAddress      string    `json:"ip_address" gorm:"size:45"`
	DeviceInfo     string    `json:"device_info" gorm:"type:text"`
	SignatureType  string    `json:"signature_type" gorm:"size:30;not null;default:'digital'"`
	Status         string    `json:"status" gorm:"size:20;not null;default:'active'"` // 'active', 'expired', 'revoked'
	DocumentURL    string    `json:"document_url" gorm:"size:255"`
	ReminderSent   bool      `json:"reminder_sent" gorm:"default:false"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy      uint      `json:"created_by" gorm:"not null"`

	// Relacionamentos
	Teacher  User                   `json:"teacher,omitempty" gorm:"foreignKey:TeacherID"`
	Template VolunteerTermTemplate  `json:"template,omitempty" gorm:"foreignKey:TemplateID"`
	History  []VolunteerTermHistory `json:"history,omitempty" gorm:"foreignKey:TermID"`
	Creator  User                   `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

// VolunteerTermHistory representa um registro no histórico de um termo de voluntariado
type VolunteerTermHistory struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	TermID     uint      `json:"term_id" gorm:"not null"`
	ActionType string    `json:"action_type" gorm:"size:30;not null"` // 'signed', 'viewed', 'expired', 'renewed'
	ActionDate time.Time `json:"action_date" gorm:"not null"`
	ActionByID *uint     `json:"action_by_id"`
	Details    string    `json:"details" gorm:"type:text"`
	CreatedBy  uint      `json:"created_by" gorm:"not null"`

	// Relacionamentos
	Term         VolunteerTerm `json:"-" gorm:"foreignKey:TermID"`
	ActionByUser *User         `json:"action_by,omitempty" gorm:"foreignKey:ActionByID"`
	Creator      User          `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

// TableName especifica o nome da tabela no banco de dados
func (VolunteerTermTemplate) TableName() string {
	return "volunteer_term_templates"
}

func (VolunteerTerm) TableName() string {
	return "volunteer_terms"
}

func (VolunteerTermHistory) TableName() string {
	return "volunteer_term_history"
}
