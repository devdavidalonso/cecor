package models

import (
	"time"
)

// Attendance represents a student's attendance record for a course class
type Attendance struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	StudentID      uint      `json:"studentId" gorm:"not null;index"`
	CourseID       uint      `json:"courseId" gorm:"not null;index"`
	Date           time.Time `json:"date" gorm:"not null;index"`
	Status         string    `json:"status" gorm:"not null"` // present, absent, partial
	Module         string    `json:"module"`                 // Specific module of the class, if applicable
	Justification  string    `json:"justification"`
	HasAttachment  bool      `json:"hasAttachment" gorm:"default:false"`
	AttachmentURL  string    `json:"attachmentUrl"`
	Notes          string    `json:"notes"`
	RegisteredByID uint      `json:"registeredById" gorm:"not null"`
	CreatedAt      time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (Attendance) TableName() string {
	return "attendances"
}

// AbsenceJustification represents a justification for absences
type AbsenceJustification struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	StudentID     uint       `json:"studentId" gorm:"not null;index"`
	CourseID      uint       `json:"courseId" gorm:"not null;index"`
	StartDate     time.Time  `json:"startDate" gorm:"not null"`
	EndDate       time.Time  `json:"endDate" gorm:"not null"`
	Reason        string     `json:"reason" gorm:"type:text;not null"`
	DocumentURL   string     `json:"documentUrl"`
	Status        string     `json:"status" gorm:"not null;default:'pending'"` // pending, approved, rejected
	Notes         string     `json:"notes"`
	SubmittedByID uint       `json:"submittedById" gorm:"not null"`
	ReviewedByID  *uint      `json:"reviewedById"`
	ReviewDate    *time.Time `json:"reviewDate"`
	CreatedAt     time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt     time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (AbsenceJustification) TableName() string {
	return "absence_justifications"
}

// AbsenceAlert represents an alert for excessive absences
type AbsenceAlert struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	StudentID        uint       `json:"studentId" gorm:"not null;index"`
	CourseID         uint       `json:"courseId" gorm:"not null;index"`
	Level            int        `json:"level" gorm:"not null"` // 1, 2, 3, 4 (progressive)
	AbsenceCount     int        `json:"absenceCount" gorm:"not null"`
	FirstAbsenceDate time.Time  `json:"firstAbsenceDate"`
	LastAbsenceDate  time.Time  `json:"lastAbsenceDate"`
	Status           string     `json:"status" gorm:"not null;default:'open'"` // open, resolved
	NotificationSent bool       `json:"notificationSent" gorm:"default:false"`
	NotificationDate *time.Time `json:"notificationDate"`
	ResolvedByID     *uint      `json:"resolvedById"`
	ResolutionDate   *time.Time `json:"resolutionDate"`
	ResolutionNotes  string     `json:"resolutionNotes"`
	CreatedAt        time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (AbsenceAlert) TableName() string {
	return "absence_alerts"
}

// AbsenceCompensation represents a compensatory activity for absences
type AbsenceCompensation struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	StudentID      uint       `json:"studentId" gorm:"not null;index"`
	CourseID       uint       `json:"courseId" gorm:"not null;index"`
	AbsenceDates   string     `json:"absenceDates" gorm:"not null"` // JSON format with dates
	Activity       string     `json:"activity" gorm:"type:text;not null"`
	DueDate        time.Time  `json:"dueDate" gorm:"not null"`
	Status         string     `json:"status" gorm:"not null;default:'pending'"` // pending, submitted, evaluated, approved, rejected
	Evaluation     string     `json:"evaluation"`
	DocumentURL    string     `json:"documentUrl"`
	RegisteredByID uint       `json:"registeredById" gorm:"not null"`
	EvaluatedByID  *uint      `json:"evaluatedById"`
	EvaluationDate *time.Time `json:"evaluationDate"`
	CreatedAt      time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (AbsenceCompensation) TableName() string {
	return "absence_compensations"
}

// Notification represents a notification sent to a user
type Notification struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	UserID           uint       `json:"userId" gorm:"not null;index"`
	Title            string     `json:"title" gorm:"not null"`
	Message          string     `json:"message" gorm:"type:text;not null"`
	Type             string     `json:"type" gorm:"not null"` // absence, event, system, etc.
	EntityType       string     `json:"entityType"`           // student, course, enrollment, etc.
	EntityID         *uint      `json:"entityId"`
	DeliveryStatus   string     `json:"deliveryStatus" gorm:"not null;default:'pending'"` // pending, delivered, failed
	DeliveryAttempts int        `json:"deliveryAttempts" gorm:"not null;default:0"`
	LastAttemptDate  *time.Time `json:"lastAttemptDate"`
	DeliveryDate     *time.Time `json:"deliveryDate"`
	ReadDate         *time.Time `json:"readDate"`
	ErrorMessage     string     `json:"errorMessage"`
	CreatedAt        time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (Notification) TableName() string {
	return "notifications"
}

// NotificationChannel represents a communication channel for notifications
type NotificationChannel struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	UserID       uint       `json:"userId" gorm:"not null;index"`
	Type         string     `json:"type" gorm:"not null"`       // email, telegram, sms, push, app
	Identifier   string     `json:"identifier" gorm:"not null"` // Email address, phone number, Telegram chat ID
	Active       bool       `json:"active" gorm:"default:true"`
	Primary      bool       `json:"primary" gorm:"default:false"`
	Verified     bool       `json:"verified" gorm:"default:false"`
	VerifiedDate *time.Time `json:"verifiedDate"`
	CreatedAt    time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (NotificationChannel) TableName() string {
	return "notification_channels"
}

// NotificationConfig represents a user's notification preferences
type NotificationConfig struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	UserID            uint      `json:"userId" gorm:"not null;index"`
	NotificationType  string    `json:"notificationType" gorm:"not null"` // absence, event, system, etc.
	Enabled           bool      `json:"enabled" gorm:"default:true"`
	EnabledChannels   string    `json:"enabledChannels" gorm:"not null"` // JSON format with enabled channels (email, telegram, etc.)
	AllowedTimeframes string    `json:"allowedTimeframes"`               // JSON format with allowed timeframes
	CreatedAt         time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (NotificationConfig) TableName() string {
	return "notification_configs"
}

// NotificationTemplate represents a template for notifications
type NotificationTemplate struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null"` // absence, event, system, etc.
	Subject     string    `json:"subject" gorm:"not null"`
	HTMLContent string    `json:"htmlContent" gorm:"type:text;not null"`
	TextContent string    `json:"textContent" gorm:"type:text;not null"`
	Variables   string    `json:"variables" gorm:"type:json"` // List of variables available for the template
	Active      bool      `json:"active" gorm:"default:true"`
	IsDefault   bool      `json:"isDefault" gorm:"default:false"`
	CreatedByID uint      `json:"createdById" gorm:"not null"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (NotificationTemplate) TableName() string {
	return "notification_templates"
}

// ScheduledNotification represents a notification scheduled to be sent in the future
type ScheduledNotification struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	TemplateID   uint       `json:"templateId" gorm:"not null"`
	UserID       uint       `json:"userId" gorm:"not null;index"`
	Data         string     `json:"data" gorm:"type:json;not null"` // Data to fill the template
	ScheduleDate time.Time  `json:"scheduleDate" gorm:"not null;index"`
	Status       string     `json:"status" gorm:"not null;default:'scheduled'"` // scheduled, sent, cancelled, failed
	SentDate     *time.Time `json:"sentDate"`
	ErrorMessage string     `json:"errorMessage"`
	CreatedByID  uint       `json:"createdById" gorm:"not null"`
	CreatedAt    time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (ScheduledNotification) TableName() string {
	return "scheduled_notifications"
}
