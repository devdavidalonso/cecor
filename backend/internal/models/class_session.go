// backend/internal/models/class_session.go
package models

import (
	"time"
)

// ClassSession represents a scheduled class/lesson for a course
type ClassSession struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	
	// Relações - Course (legado) e CourseClass (novo)
	// Durante a transição, ambos podem existir. CourseClassID é a forma nova.
	CourseID      uint  `json:"courseId" gorm:"not null;index"`      // LEGADO: Mantido para compatibilidade
	CourseClassID *uint `json:"courseClassId" gorm:"index"`           // NOVO: Referência para a turma
	
	// Overrides específicos da aula
	LocationID *uint     `json:"locationId" gorm:"index"`  // Override de sala
	Location   *Location `json:"location,omitempty" gorm:"foreignKey:LocationID"`
	TeacherID  *uint     `json:"teacherId" gorm:"index"`   // Override de professor (substituição)
	Teacher    *Teacher  `json:"teacher,omitempty" gorm:"foreignKey:TeacherID"`
	
	// Data e horário
	Date      time.Time `json:"date" gorm:"not null"`
	StartTime string    `json:"startTime,omitempty"` // Override do horário
	EndTime   string    `json:"endTime,omitempty"`   // Override do horário
	
	// Conteúdo
	Topic           string `json:"topic"`                       // Tema específico (legado)
	SyllabusTopicID *uint  `json:"syllabusTopicId,omitempty" gorm:"index"` // Referência para ementa
	TopicOverride   string `json:"topicOverride,omitempty"`     // Tema especial (substitui ementa)
	
	// Status
	IsCancelled        bool   `json:"isCancelled" gorm:"default:false"`
	CancellationReason string `json:"cancellationReason"`
	
	// Metadados
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (ClassSession) TableName() string {
	return "class_sessions"
}

// IsSubstituted retorna true se a aula tem um professor substituto
func (s ClassSession) IsSubstituted() bool {
	return s.TeacherID != nil
}

// GetEffectiveTeacherID retorna o ID do professor efetivo (substituto ou padrão)
func (s ClassSession) GetEffectiveTeacherID(defaultTeacherID uint) uint {
	if s.TeacherID != nil {
		return *s.TeacherID
	}
	return defaultTeacherID
}
