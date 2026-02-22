// backend/internal/models/teacher_skills.go
package models

import (
	"time"
)

// Skill - Habilidade/tag para professores (tabela global)
// Ex: "Inglês", "Excel", "Conversação", "Gramática"
type Skill struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null;unique"` // "Inglês", "Excel"
	Domain      string    `json:"domain"`                      // "Idiomas", "Tecnologia", "Artes"
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (Skill) TableName() string {
	return "skills"
}

// TeacherSkill - N:N Teacher <-> Skill com nível de proficiência
type TeacherSkill struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TeacherID uint      `json:"teacherId" gorm:"not null;index"`
	Teacher   Teacher   `json:"teacher,omitempty" gorm:"foreignKey:TeacherID"`
	SkillID   uint      `json:"skillId" gorm:"not null;index"`
	Skill     Skill     `json:"skill,omitempty" gorm:"foreignKey:SkillID"`
	Level     string    `json:"level" gorm:"default:'intermediate'"` // beginner, intermediate, advanced, expert
	Notes     string    `json:"notes"`                               // Observações sobre a experiência
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (TeacherSkill) TableName() string {
	return "teacher_skills"
}

// TeacherAvailability - Disponibilidade semanal do professor
type TeacherAvailability struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TeacherID uint      `json:"teacherId" gorm:"not null;index"`
	Teacher   Teacher   `json:"teacher,omitempty" gorm:"foreignKey:TeacherID"`
	DayOfWeek int       `json:"dayOfWeek" gorm:"not null"` // 0=Domingo, 1=Segunda...
	StartTime string    `json:"startTime" gorm:"not null"` // "09:00"
	EndTime   string    `json:"endTime" gorm:"not null"`   // "18:00"
	IsActive  bool      `json:"isActive" gorm:"default:true"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (TeacherAvailability) TableName() string {
	return "teacher_availability"
}

// TeacherAbsence - Registro de ausência do professor
type TeacherAbsence struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	TeacherID   uint       `json:"teacherId" gorm:"not null;index"`
	Teacher     Teacher    `json:"teacher,omitempty" gorm:"foreignKey:TeacherID"`
	StartDate   time.Time  `json:"startDate" gorm:"not null"`
	EndDate     time.Time  `json:"endDate" gorm:"not null"`
	Reason      string     `json:"reason"`
	Status      string     `json:"status" gorm:"not null;default:'active'"` // active, resolved, cancelled
	CreatedByID uint       `json:"createdById" gorm:"not null"`
	ResolvedAt  *time.Time `json:"resolvedAt"`
	ResolvedByID *uint     `json:"resolvedById"`
	CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (TeacherAbsence) TableName() string {
	return "teacher_absences"
}

// Substitution - Registro de substituição de professor
type Substitution struct {
	ID                 uint         `json:"id" gorm:"primaryKey"`
	OriginalTeacherID  uint         `json:"originalTeacherId" gorm:"not null;index"`
	OriginalTeacher    Teacher      `json:"originalTeacher,omitempty" gorm:"foreignKey:OriginalTeacherID"`
	SubstituteTeacherID uint        `json:"substituteTeacherId" gorm:"not null;index"`
	SubstituteTeacher  Teacher      `json:"substituteTeacher,omitempty" gorm:"foreignKey:SubstituteTeacherID"`
	CourseClassID      uint         `json:"courseClassId" gorm:"not null;index"`
	CourseClass        CourseClass  `json:"courseClass,omitempty" gorm:"foreignKey:CourseClassID"`
	ClassSessionID     *uint        `json:"classSessionId,omitempty" gorm:"index"` // Específico ou NULL para período
	Date               time.Time    `json:"date" gorm:"not null"`
	Status             string       `json:"status" gorm:"not null;default:'pending'"` // pending, confirmed, declined, completed
	RequestedByID      uint         `json:"requestedById" gorm:"not null"`
	Notes              string       `json:"notes"`
	ResponseNotes      string       `json:"responseNotes"`
	RespondedAt        *time.Time   `json:"respondedAt"`
	CreatedAt          time.Time    `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt          time.Time    `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName retorna o nome da tabela
func (Substitution) TableName() string {
	return "substitutions"
}
