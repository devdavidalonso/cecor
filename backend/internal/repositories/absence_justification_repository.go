package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// AbsenceJustificationRepository implements database operations for Absence Justifications
type AbsenceJustificationRepository struct {
	db *gorm.DB
}

// NewAbsenceJustificationRepository creates a new instance of AbsenceJustificationRepository
func NewAbsenceJustificationRepository(db *gorm.DB) *AbsenceJustificationRepository {
	return &AbsenceJustificationRepository{db}
}

// FindAll returns all absence justifications
func (r *AbsenceJustificationRepository) FindAll() ([]models.AbsenceJustification, error) {
	var justifications []models.AbsenceJustification
	if err := r.db.Find(&justifications).Error; err != nil {
		return nil, err
	}
	return justifications, nil
}

// FindByID returns an absence justification by ID
func (r *AbsenceJustificationRepository) FindByID(id uint) (models.AbsenceJustification, error) {
	var justification models.AbsenceJustification
	if err := r.db.First(&justification, id).Error; err != nil {
		return justification, err
	}
	return justification, nil
}

// Create creates a new absence justification
func (r *AbsenceJustificationRepository) Create(justification models.AbsenceJustification) (models.AbsenceJustification, error) {
	if err := r.db.Create(&justification).Error; err != nil {
		return justification, err
	}
	return justification, nil
}

// Update updates an absence justification
func (r *AbsenceJustificationRepository) Update(justification models.AbsenceJustification) (models.AbsenceJustification, error) {
	if err := r.db.Save(&justification).Error; err != nil {
		return justification, err
	}
	return justification, nil
}

// FindPendingJustifications returns all pending absence justifications
func (r *AbsenceJustificationRepository) FindPendingJustifications() ([]models.AbsenceJustification, error) {
	var justifications []models.AbsenceJustification
	if err := r.db.Where("status = ?", "pending").Preload("Student").Preload("Course").Find(&justifications).Error; err != nil {
		return nil, err
	}
	return justifications, nil
}

// FindByStudent returns all absence justifications for a student
func (r *AbsenceJustificationRepository) FindByStudent(studentID uint) ([]models.AbsenceJustification, error) {
	var justifications []models.AbsenceJustification
	if err := r.db.Where("student_id = ?", studentID).Preload("Course").Find(&justifications).Error; err != nil {
		return nil, err
	}
	return justifications, nil
}

// CreateAbsenceJustification creates a new absence justification
func (r *AbsenceJustificationRepository) CreateAbsenceJustification(justification models.AbsenceJustification) error {
	return r.db.Create(&justification).Error
}

// UpdateAbsenceJustification updates an absence justification
func (r *AbsenceJustificationRepository) UpdateAbsenceJustification(justification models.AbsenceJustification) error {
	return r.db.Save(&justification).Error
}

// FindPendingJustifications finds pending justifications for a specific course
func (r *AbsenceJustificationRepository) FindPendingJustificationsByCourse(courseID uint) ([]models.AbsenceJustification, error) {
	var justifications []models.AbsenceJustification
	query := r.db.Where("status = ?", "pending")

	if courseID > 0 {
		query = query.Where("course_id = ?", courseID)
	}

	err := query.Preload("Student").
		Preload("Course").
		Find(&justifications).Error

	return justifications, err
}
