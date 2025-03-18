// internal/models/interview.go

package models

import (
	"time"
)

// Form represents a questionnaire or form template
type Form struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	Title          string    `json:"title" gorm:"size:100;not null"`
	Description    string    `json:"description" gorm:"type:text"`
	Type           string    `json:"type" gorm:"size:30;not null"` // 'enrollment', 'feedback', 'evaluation'
	IsRequired     bool      `json:"is_required" gorm:"default:false"`
	TargetAudience string    `json:"target_audience" gorm:"size:30;not null"` // 'student', 'guardian', 'teacher'
	Status         string    `json:"status" gorm:"size:20;not null;default:'draft'"` // 'draft', 'active', 'inactive'
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy      uint      `json:"created_by" gorm:"not null"`
	DeletedAt      *time.Time `json:"deleted_at" gorm:"index"`
	
	// Relationships
	Questions      []FormQuestion `json:"questions,omitempty" gorm:"foreignKey:FormID"`
	CreatedBy      User          `json:"created_by,omitempty" gorm:"foreignKey:CreatedBy"`
}

// FormQuestion represents a question in a form
type FormQuestion struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	FormID              uint      `json:"form_id" gorm:"not null"`
	QuestionText        string    `json:"question_text" gorm:"type:text;not null"`
	HelpText            string    `json:"help_text" gorm:"type:text"`
	QuestionType        string    `json:"question_type" gorm:"size:30;not null"` // 'text', 'multiple_choice', 'likert', 'file', 'date'
	Options             string    `json:"options" gorm:"type:text"` // JSON string for choices
	IsRequired          bool      `json:"is_required" gorm:"default:true"`
	DisplayOrder        int       `json:"display_order" gorm:"not null"`
	ConditionalParentID *uint     `json:"conditional_parent_id"`
	ConditionalValue    string    `json:"conditional_value"`
	ValidationRules     string    `json:"validation_rules" gorm:"type:text"` // JSON string for validation
	CreatedAt           time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	
	// Relationships
	Form                Form      `json:"-" gorm:"foreignKey:FormID"`
	ConditionalParent   *FormQuestion `json:"-" gorm:"foreignKey:ConditionalParentID"`
}

// Interview represents a scheduled interview
type Interview struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	FormID          uint      `json:"form_id" gorm:"not null"`
	UserID          uint      `json:"user_id" gorm:"not null"` // The interviewee
	ScheduledDate   time.Time `json:"scheduled_date" gorm:"not null"`
	InterviewerID   *uint     `json:"interviewer_id"`
	Status          string    `json:"status" gorm:"size:20;not null;default:'scheduled'"` // 'scheduled', 'completed', 'canceled', 'rescheduled'
	CompletionDate  *time.Time `json:"completion_date"`
	Notes           string    `json:"notes" gorm:"type:text"`
	TriggerType     string    `json:"trigger_type" gorm:"size:30"` // 'enrollment', 'periodic'
	RelatedEntity   string    `json:"related_entity" gorm:"size:30"`
	RelatedID       *uint     `json:"related_id"`
	ReminderSent    bool      `json:"reminder_sent" gorm:"default:false"`
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	
	// Relationships
	Form            Form      `json:"form,omitempty" gorm:"foreignKey:FormID"`
	User            User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Interviewer     *User     `json:"interviewer,omitempty" gorm:"foreignKey:InterviewerID"`
	Responses       []FormResponse `json:"responses,omitempty" gorm:"foreignKey:InterviewID"`
}

// FormResponse represents a submission of answers to a form
type FormResponse struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	InterviewID      *uint     `json:"interview_id"`
	FormID           uint      `json:"form_id" gorm:"not null"`
	UserID           uint      `json:"user_id" gorm:"not null"`
	SubmissionDate   time.Time `json:"submission_date" gorm:"not null"`
	CompletionStatus string    `json:"completion_status" gorm:"size:20;not null;default:'complete'"` // 'complete', 'partial'
	IPAddress        string    `json:"ip_address" gorm:"size:45"`
	CreatedAt        time.Time `json:"created_at" gorm:"autoCreateTime"`
	
	// Relationships
	Interview        *Interview `json:"interview,omitempty" gorm:"foreignKey:InterviewID"`
	Form             Form      `json:"form,omitempty" gorm:"foreignKey:FormID"`
	User             User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	AnswerDetails    []FormAnswerDetail `json:"answer_details,omitempty" gorm:"foreignKey:ResponseID"`
}

// FormAnswerDetail represents an individual answer to a question
type FormAnswerDetail struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	ResponseID    uint      `json:"response_id" gorm:"not null"`
	QuestionID    uint      `json:"question_id" gorm:"not null"`
	AnswerText    string    `json:"answer_text" gorm:"type:text"`
	AnswerOptions string    `json:"answer_options" gorm:"type:text"` // JSON for multiple choices
	FileURL       string    `json:"file_url" gorm:"size:255"`
	CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
	
	// Relationships
	Response      FormResponse `json:"-" gorm:"foreignKey:ResponseID"`
	Question      FormQuestion `json:"question,omitempty" gorm:"foreignKey:QuestionID"`
}

// TableName specifies the database table name
func (Form) TableName() string {
	return "forms"
}

func (FormQuestion) TableName() string {
	return "form_questions"
}

func (Interview) TableName() string {
	return "interviews"
}

func (FormResponse) TableName() string {
	return "form_responses"
}

func (FormAnswerDetail) TableName() string {
	return "form_answer_details"
}