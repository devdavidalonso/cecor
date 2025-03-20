// repositories/student_repository.go
package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// StudentRepository implements database operations for Students
type StudentRepository struct {
	db *gorm.DB
}

// NewStudentRepository creates a new instance of StudentRepository
func NewStudentRepository(db *gorm.DB) *StudentRepository {
	return &StudentRepository{db}
}

// FindAll returns all students
func (r *StudentRepository) FindAll() ([]models.Student, error) {
	var students []models.Student
	if err := r.db.Find(&students).Error; err != nil {
		return nil, err
	}
	return students, nil
}

// FindByID returns a student by ID
func (r *StudentRepository) FindByID(id uint) (models.Student, error) {
	var student models.Student
	if err := r.db.First(&student, id).Error; err != nil {
		return student, err
	}
	return student, nil
}

// Create creates a new student
func (r *StudentRepository) Create(student *models.Student) error {
	return r.db.Create(student).Error
}

// Update updates a student
func (r *StudentRepository) Update(student models.Student) error {
	return r.db.Save(&student).Error
}

// Delete removes a student
func (r *StudentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Student{}, id).Error
}

// FindByUserID returns a student by user ID
func (r *StudentRepository) FindByUserID(userID uint) (models.Student, error) {
	var student models.Student
	if err := r.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		return student, err
	}
	return student, nil
}

// FindWithGuardians returns a student with guardians loaded
func (r *StudentRepository) FindWithGuardians(id uint) (models.Student, error) {
	var student models.Student
	if err := r.db.Preload("Guardians").Preload("Guardians.Permissions").First(&student, id).Error; err != nil {
		return student, err
	}
	return student, nil
}
