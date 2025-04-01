package models

import (
	"time"
)

// Interview represents a scheduled interview
type Interview struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	FormID         uint       `json:"formId" gorm:"not null"`
	UserID         uint       `json:"userId" gorm:"not null;index"`
	ScheduledDate  time.Time  `json:"scheduledDate" gorm:"not null"`
	InterviewerID  *uint      `json:"interviewerId"`
	Status         string     `json:"status" gorm:"not null;default:'scheduled'"` // scheduled, completed, canceled, rescheduled
	CompletionDate *time.Time `json:"completionDate"`
	Notes          string     `json:"notes"`
	TriggerType    string     `json:"triggerType"` // enrollment, periodic
	RelatedEntity  string     `json:"relatedEntity"`
	RelatedID      *uint      `json:"relatedId"`
	ReminderSent   bool       `json:"reminderSent" gorm:"default:false"`
	CreatedAt      time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	Form           Form       `json:"form" gorm:"foreignKey:FormID"`
	User           User       `json:"user" gorm:"foreignKey:UserID"`
	Interviewer    *User      `json:"interviewer" gorm:"foreignKey:InterviewerID"`
}

// TableName specifies the database table name
func (Interview) TableName() string {
	return "interviews"
}

// FormResponse represents a set of responses to a form
type FormResponse struct {
	ID               uint               `json:"id" gorm:"primaryKey"`
	InterviewID      *uint              `json:"interviewId"`
	FormID           uint               `json:"formId" gorm:"not null"`
	UserID           uint               `json:"userId" gorm:"not null"`
	SubmissionDate   time.Time          `json:"submissionDate" gorm:"not null"`
	CompletionStatus string             `json:"completionStatus" gorm:"not null;default:'complete'"` // complete, partial
	IPAddress        string             `json:"ipAddress"`
	CreatedAt        time.Time          `json:"createdAt" gorm:"autoCreateTime"`
	Interview        *Interview         `json:"interview" gorm:"foreignKey:InterviewID"`
	Form             Form               `json:"form" gorm:"foreignKey:FormID"`
	User             User               `json:"user" gorm:"foreignKey:UserID"`
	AnswerDetails    []FormAnswerDetail `json:"answerDetails" gorm:"foreignKey:ResponseID"`
}

// TableName specifies the database table name
func (FormResponse) TableName() string {
	return "form_responses"
}

// FormAnswerDetail represents the details of a response to a specific question
type FormAnswerDetail struct {
	ID            uint         `json:"id" gorm:"primaryKey"`
	ResponseID    uint         `json:"responseId" gorm:"not null;index"`
	QuestionID    uint         `json:"questionId" gorm:"not null"`
	AnswerText    string       `json:"answerText"`
	AnswerOptions string       `json:"answerOptions"` // JSON for multiple choices
	FileURL       string       `json:"fileUrl"`
	CreatedAt     time.Time    `json:"createdAt" gorm:"autoCreateTime"`
	Response      FormResponse `json:"response" gorm:"foreignKey:ResponseID"`
	Question      FormQuestion `json:"question" gorm:"foreignKey:QuestionID"`
}

// TableName specifies the database table name
func (FormAnswerDetail) TableName() string {
	return "form_answer_details"
}
