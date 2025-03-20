// models/certificate.go
package models

import (
	"time"
)

// Certificate representa um certificado emitido para um aluno
type Certificate struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	EnrollmentID     uint       `json:"enrollment_id" gorm:"not null;index"`
	StudentID        uint       `json:"student_id" gorm:"not null;index"`
	CourseID         uint       `json:"course_id" gorm:"not null;index"`
	Type             string     `json:"type" gorm:"size:30;not null"` // 'conclusao', 'participacao', 'em_curso'
	IssueDate        time.Time  `json:"issue_date" gorm:"not null"`
	ExpiryDate       *time.Time `json:"expiry_date"`
	CertificateURL   string     `json:"certificate_url" gorm:"size:255"`
	QRCodeURL        string     `json:"qr_code_url" gorm:"size:255"`
	VerificationCode string     `json:"verification_code" gorm:"size:50;unique"`
	Status           string     `json:"status" gorm:"size:20;not null;default:'active'"` // 'active', 'revoked', 'expired'
	RevocationReason string     `json:"revocation_reason" gorm:"type:text"`
	CreatedAt        time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy        uint       `json:"created_by" gorm:"not null"`

	// Relacionamentos
	Enrollment Enrollment `json:"enrollment,omitempty" gorm:"foreignKey:EnrollmentID"`
	Student    User       `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	Course     Course     `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Creator    User       `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

// CertificateTemplate representa um modelo de certificado
type CertificateTemplate struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Type        string    `json:"type" gorm:"size:30;not null"` // 'conclusao', 'participacao', 'em_curso'
	HTMLContent string    `json:"html_content" gorm:"type:text;not null"`
	CSSStyle    string    `json:"css_style" gorm:"type:text"`
	IsDefault   bool      `json:"is_default" gorm:"default:false"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	CreatedBy   uint      `json:"created_by" gorm:"not null"`

	// Relacionamentos
	Creator User `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

// TableName especifica o nome da tabela no banco de dados
func (Certificate) TableName() string {
	return "certificates"
}

func (CertificateTemplate) TableName() string {
	return "certificate_templates"
}
