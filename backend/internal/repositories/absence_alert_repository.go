package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// AbsenceAlertRepository implements database operations for Absence Alerts
type AbsenceAlertRepository struct {
	db *gorm.DB
}

// NewAbsenceAlertRepository creates a new instance of AbsenceAlertRepository
func NewAbsenceAlertRepository(db *gorm.DB) *AbsenceAlertRepository {
	return &AbsenceAlertRepository{db}
}

// FindAll returns all absence alerts
func (r *AbsenceAlertRepository) FindAll() ([]models.AbsenceAlert, error) {
	var alerts []models.AbsenceAlert
	if err := r.db.Find(&alerts).Error; err != nil {
		return nil, err
	}
	return alerts, nil
}

// FindByID returns an absence alert by ID
func (r *AbsenceAlertRepository) FindByID(id uint) (models.AbsenceAlert, error) {
	var alert models.AbsenceAlert
	if err := r.db.First(&alert, id).Error; err != nil {
		return alert, err
	}
	return alert, nil
}

// Create creates a new absence alert
func (r *AbsenceAlertRepository) Create(alert models.AbsenceAlert) (models.AbsenceAlert, error) {
	if err := r.db.Create(&alert).Error; err != nil {
		return alert, err
	}
	return alert, nil
}

// Update updates an absence alert
func (r *AbsenceAlertRepository) Update(alert models.AbsenceAlert) (models.AbsenceAlert, error) {
	if err := r.db.Save(&alert).Error; err != nil {
		return alert, err
	}
	return alert, nil
}

// FindOpenAlertsByStudent returns all open absence alerts for a student
func (r *AbsenceAlertRepository) FindOpenAlertsByStudent(studentID uint) ([]models.AbsenceAlert, error) {
	var alerts []models.AbsenceAlert
	if err := r.db.Where("student_id = ? AND status = ?", studentID, "open").Find(&alerts).Error; err != nil {
		return nil, err
	}
	return alerts, nil
}
