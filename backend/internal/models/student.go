package models

import (
	"time"
)

// Student represents a student in the system
// It specializes the User entity by having a reference to a User
type Student struct {
	ID                 uint       `json:"id" gorm:"primaryKey"`
	UserID             uint       `json:"userId" gorm:"not null;unique;index"` // Reference to User entity
	RegistrationNumber string     `json:"registrationNumber" gorm:"not null;unique"`
	Status             string     `json:"status" gorm:"not null;default:'active'"` // active, inactive, suspended
	SpecialNeeds       string     `json:"specialNeeds"`
	MedicalInfo        string     `json:"medicalInfo"`
	SocialMedia        *string    `json:"socialMedia" gorm:"type:json"`
	Notes              string     `json:"notes"`
	CreatedAt          time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt          time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt          *time.Time `json:"deletedAt" gorm:"index"`

	// Associations
	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Guardians    []Guardian    `json:"guardians,omitempty" gorm:"foreignKey:StudentID"`
	Documents    []Document    `json:"documents,omitempty" gorm:"foreignKey:StudentID"`
	StudentNotes []StudentNote `json:"studentNotes,omitempty" gorm:"foreignKey:StudentID"`
	Enrollments  []Enrollment  `json:"enrollments,omitempty" gorm:"foreignKey:StudentID"`
}

// TableName defines the table name in the database
func (Student) TableName() string {
	return "students"
}
