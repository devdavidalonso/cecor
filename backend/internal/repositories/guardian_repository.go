// repositories/guardian_repository.go
package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// GuardianRepository implements database operations for Guardians
type GuardianRepository struct {
	db *gorm.DB
}

// NewGuardianRepository creates a new instance of GuardianRepository
func NewGuardianRepository(db *gorm.DB) *GuardianRepository {
	return &GuardianRepository{db}
}

// FindAll returns all guardians
func (r *GuardianRepository) FindAll() ([]models.Guardian, error) {
	var guardians []models.Guardian
	if err := r.db.Find(&guardians).Error; err != nil {
		return nil, err
	}
	return guardians, nil
}

// FindByID returns a guardian by ID
func (r *GuardianRepository) FindByID(id uint) (models.Guardian, error) {
	var guardian models.Guardian
	if err := r.db.Preload("Permissions").First(&guardian, id).Error; err != nil {
		return guardian, err
	}
	return guardian, nil
}

// Create creates a new guardian
func (r *GuardianRepository) Create(guardian *models.Guardian) error {
	return r.db.Create(guardian).Error
}

// Update updates a guardian
func (r *GuardianRepository) Update(guardian models.Guardian) error {
	return r.db.Save(&guardian).Error
}

// Delete removes a guardian
func (r *GuardianRepository) Delete(id uint) error {
	return r.db.Delete(&models.Guardian{}, id).Error
}

// FindByStudentID returns all guardians for a student
func (r *GuardianRepository) FindByStudentID(studentID uint) ([]models.Guardian, error) {
	var guardians []models.Guardian
	if err := r.db.Where("student_id = ?", studentID).Preload("Permissions").Find(&guardians).Error; err != nil {
		return nil, err
	}
	return guardians, nil
}
