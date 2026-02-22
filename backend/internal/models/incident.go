// backend/internal/models/incident.go
package models

import (
	"time"
)

// IncidentType represents the type of incident
type IncidentType string

const (
	IncidentTypeDisciplinary   IncidentType = "disciplinary"   // Problemas comportamentais
	IncidentTypeInfrastructure IncidentType = "infrastructure" // Problemas físicos (torneira, luz, etc.)
	IncidentTypeHealth         IncidentType = "health"         // Questões de saúde
	IncidentTypeSafety         IncidentType = "safety"         // Segurança
	IncidentTypeOther          IncidentType = "other"          // Outros
)

// IncidentSeverity represents the severity level of an incident
type IncidentSeverity string

const (
	IncidentSeverityLow      IncidentSeverity = "low"      // Baixa
	IncidentSeverityMedium   IncidentSeverity = "medium"   // Média
	IncidentSeverityHigh     IncidentSeverity = "high"     // Alta
	IncidentSeverityCritical IncidentSeverity = "critical" // Crítica
)

// IncidentStatus represents the status of an incident
type IncidentStatus string

const (
	IncidentStatusOpen       IncidentStatus = "open"        // Aberta
	IncidentStatusInAnalysis IncidentStatus = "in_analysis" // Em análise
	IncidentStatusResolved   IncidentStatus = "resolved"    // Resolvida
	IncidentStatusCancelled  IncidentStatus = "cancelled"   // Cancelada
)

// Incident represents an occurrence or problem reported in the system
type Incident struct {
	ID          uint             `json:"id" gorm:"primaryKey"`
	Type        IncidentType     `json:"type" gorm:"not null"`           // disciplinary, infrastructure, health, safety, other
	Severity    IncidentSeverity `json:"severity" gorm:"not null"`         // low, medium, high, critical
	Title       string           `json:"title" gorm:"not null"`            // Título resumido
	Description string           `json:"description" gorm:"type:text;not null"` // Descrição detalhada
	Status      IncidentStatus   `json:"status" gorm:"not null;default:'open'"` // open, in_analysis, resolved, cancelled

	// Optional relationships
	CourseID       *uint          `json:"courseId,omitempty" gorm:"index"`        // Curso relacionado (opcional)
	Course         *Course        `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	ClassSessionID *uint          `json:"classSessionId,omitempty" gorm:"index"`  // Aula específica (opcional)
	ClassSession   *ClassSession  `json:"classSession,omitempty" gorm:"foreignKey:ClassSessionID"`
	StudentID      *uint          `json:"studentId,omitempty" gorm:"index"`       // Aluno envolvido (opcional)
	Student        *Student       `json:"student,omitempty" gorm:"foreignKey:StudentID"`

	// Reporter (quem registrou)
	ReportedByID uint `json:"reportedById" gorm:"not null;index"`
	ReportedBy   User `json:"reportedBy,omitempty" gorm:"foreignKey:ReportedByID"`

	// Resolution
	ResolutionNotes *string    `json:"resolutionNotes,omitempty" gorm:"type:text"` // Notas da resolução
	ResolvedByID    *uint      `json:"resolvedById,omitempty"`                       // Quem resolveu
	ResolvedBy      *User      `json:"resolvedBy,omitempty" gorm:"foreignKey:ResolvedByID"`
	ResolvedAt      *time.Time `json:"resolvedAt,omitempty"`                         // Quando foi resolvida

	// Notifications
	NotificationSent bool `json:"notificationSent" gorm:"default:false"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" gorm:"index"`
}

// TableName defines the table name in the database
func (Incident) TableName() string {
	return "incidents"
}

// IsOpen returns true if the incident is open or in analysis
func (i *Incident) IsOpen() bool {
	return i.Status == IncidentStatusOpen || i.Status == IncidentStatusInAnalysis
}

// CanEdit returns true if the incident can be edited (only open incidents)
func (i *Incident) CanEdit() bool {
	return i.Status == IncidentStatusOpen
}

// IncidentComment represents comments/updates on an incident
type IncidentComment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	IncidentID uint     `json:"incidentId" gorm:"not null;index"`
	Incident   Incident `json:"incident,omitempty" gorm:"foreignKey:IncidentID"`
	
	UserID  uint   `json:"userId" gorm:"not null"`
	User    User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Comment string `json:"comment" gorm:"type:text;not null"`
	
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// TableName defines the table name in the database
func (IncidentComment) TableName() string {
	return "incident_comments"
}

// IncidentAttachment represents files attached to an incident
type IncidentAttachment struct {
	ID         uint     `json:"id" gorm:"primaryKey"`
	IncidentID uint     `json:"incidentId" gorm:"not null;index"`
	Incident   Incident `json:"incident,omitempty" gorm:"foreignKey:IncidentID"`
	
	FileName string `json:"fileName" gorm:"not null"`
	FileURL  string `json:"fileUrl" gorm:"not null"`
	FileType string `json:"fileType"` // image, document, etc.
	FileSize int64  `json:"fileSize"`
	
	UploadedByID uint      `json:"uploadedById" gorm:"not null"`
	UploadedAt   time.Time `json:"uploadedAt" gorm:"autoCreateTime"`
}

// TableName defines the table name in the database
func (IncidentAttachment) TableName() string {
	return "incident_attachments"
}
