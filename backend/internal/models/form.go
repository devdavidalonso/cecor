package models

import (
	"time"
)

// Form represents a form for interviews or evaluations
type Form struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	Title          string         `json:"title" gorm:"not null"`
	Description    string         `json:"description"`
	Type           string         `json:"type" gorm:"not null"`
	IsRequired     bool           `json:"isRequired" gorm:"default:false"`
	TargetAudience string         `json:"targetAudience" gorm:"not null"`
	Status         string         `json:"status" gorm:"not null;default:'draft'"` // draft, active, archived
	CreatedAt      time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt      *time.Time     `json:"deletedAt" gorm:"index"`
	CreatedByID    uint           `json:"createdById" gorm:"not null"`
	CreatedBy      User           `json:"createdBy" gorm:"foreignKey:CreatedByID"`
	Questions      []FormQuestion `json:"questions" gorm:"foreignKey:FormID"`
}

// TableName specifies the database table name
func (Form) TableName() string {
	return "forms"
}

// FormQuestion represents a question in a form
type FormQuestion struct {
	ID                  uint          `json:"id" gorm:"primaryKey"`
	FormID              uint          `json:"formId" gorm:"not null;index"`
	QuestionText        string        `json:"questionText" gorm:"type:text;not null"`
	HelpText            string        `json:"helpText"`
	QuestionType        string        `json:"questionType" gorm:"not null"` // text, multiple_choice, likert, file, date
	Options             string        `json:"options"`                      // JSON string for options
	IsRequired          bool          `json:"isRequired" gorm:"default:true"`
	DisplayOrder        int           `json:"displayOrder" gorm:"not null"`
	ConditionalParentID *uint         `json:"conditionalParentId"`
	ConditionalValue    string        `json:"conditionalValue"`
	ValidationRules     string        `json:"validationRules"` // JSON string for validation rules
	CreatedAt           time.Time     `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt           time.Time     `json:"updatedAt" gorm:"autoUpdateTime"`
	Form                Form          `json:"form" gorm:"foreignKey:FormID"`
	ConditionalParent   *FormQuestion `json:"conditionalParent" gorm:"foreignKey:ConditionalParentID"`
}

// TableName specifies the database table name
func (FormQuestion) TableName() string {
	return "form_questions"
}
