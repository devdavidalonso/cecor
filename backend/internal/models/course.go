// models/course.go
package models

import (
	"time"
)

// Course representa um curso no sistema
type Course struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	Name        string     `json:"name" gorm:"size:100;not null"`
	Description string     `json:"description" gorm:"type:text"`
	Workload    int        `json:"workload" gorm:"not null"` // Carga horária em horas
	MaxStudents int        `json:"max_students" gorm:"not null"`
	WeekDays    string     `json:"week_days" gorm:"size:50"`    // Ex: "1,3,5" para segunda, quarta e sexta
	StartTime   string     `json:"start_time" gorm:"type:time"` // Formato: HH:MM:SS
	EndTime     string     `json:"end_time" gorm:"type:time"`   // Formato: HH:MM:SS
	Duration    int        `json:"duration"`                    // Duração em semanas
	CreatedAt   time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	// Relacionamentos
	Enrollments []Enrollment `json:"enrollments,omitempty" gorm:"foreignKey:CourseID"`
	Attendances []Attendance `json:"attendances,omitempty" gorm:"foreignKey:CourseID"`
}

// TableName especifica o nome da tabela no banco de dados
func (Course) TableName() string {
	return "courses"
}
