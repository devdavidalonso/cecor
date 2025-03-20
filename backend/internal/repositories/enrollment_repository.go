package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// EnrollmentRepository implements database operations for Enrollments
type EnrollmentRepository struct {
	db *gorm.DB
}

// NewEnrollmentRepository creates a new instance of EnrollmentRepository
func NewEnrollmentRepository(db *gorm.DB) *EnrollmentRepository {
	return &EnrollmentRepository{db}
}

// FindAll returns all enrollments
func (r *EnrollmentRepository) FindAll() ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	if err := r.db.Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}

// FindByID returns an enrollment by ID
func (r *EnrollmentRepository) FindByID(id uint) (models.Enrollment, error) {
	var enrollment models.Enrollment
	if err := r.db.First(&enrollment, id).Error; err != nil {
		return enrollment, err
	}
	return enrollment, nil
}

// Create creates a new enrollment
func (r *EnrollmentRepository) Create(enrollment models.Enrollment) (models.Enrollment, error) {
	if err := r.db.Create(&enrollment).Error; err != nil {
		return enrollment, err
	}
	return enrollment, nil
}

// Update updates an enrollment
func (r *EnrollmentRepository) Update(enrollment models.Enrollment) (models.Enrollment, error) {
	if err := r.db.Save(&enrollment).Error; err != nil {
		return enrollment, err
	}
	return enrollment, nil
}

// Delete removes an enrollment
func (r *EnrollmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Enrollment{}, id).Error
}

// FindByCourse returns all enrollments for a course
func (r *EnrollmentRepository) FindByCourse(courseID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	if err := r.db.Where("course_id = ?", courseID).Preload("User").Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}

// FindByStudent returns all enrollments for a student
func (r *EnrollmentRepository) FindByStudent(studentID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	if err := r.db.Where("user_id = ?", studentID).Preload("Course").Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}

// FindByUserID returns all enrollments for a user
func (r *EnrollmentRepository) FindByUserID(userID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	if err := r.db.Where("user_id = ?", userID).Preload("Course").Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}

// ExistsByStudentAndCourse checks if an enrollment already exists
func (r *EnrollmentRepository) ExistsByStudentAndCourse(studentID, courseID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.Enrollment{}).
		Where("student_id = ? AND course_id = ?", studentID, courseID).
		Count(&count).Error
	return count > 0, err
}

// SoftDelete soft deletes an enrollment
func (r *EnrollmentRepository) SoftDelete(id uint) error {
	return r.db.Model(&models.Enrollment{}).Where("id = ?", id).Update("active", false).Error
}

// CountActiveByCourseID conta o número de matrículas ativas em um curso
func (r *EnrollmentRepository) CountActiveByCourseID(courseID uint) (int, error) {
	var count int64
	if err := r.db.Model(&models.Enrollment{}).
		Where("course_id = ? AND status IN (?, ?)", courseID, "ativa", "active").
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
