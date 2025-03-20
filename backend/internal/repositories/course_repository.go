package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// CourseRepository implements database operations for Courses
type CourseRepository struct {
	db *gorm.DB
}

// NewCourseRepository creates a new instance of CourseRepository
func NewCourseRepository(db *gorm.DB) *CourseRepository {
	return &CourseRepository{db}
}

// FindAll returns all active courses
func (r *CourseRepository) FindAll() ([]models.Course, error) {
	var courses []models.Course
	if err := r.db.Where("active = ?", true).Find(&courses).Error; err != nil {
		return nil, err
	}
	return courses, nil
}

// FindByID returns a course by ID
func (r *CourseRepository) FindByID(id uint) (models.Course, error) {
	var course models.Course
	if err := r.db.Where("id = ? AND active = ?", id, true).First(&course).Error; err != nil {
		return course, err
	}
	return course, nil
}

// Create creates a new course
func (r *CourseRepository) Create(course models.Course) (models.Course, error) {
	if err := r.db.Create(&course).Error; err != nil {
		return course, err
	}
	return course, nil
}

// Update updates a course
func (r *CourseRepository) Update(course models.Course) (models.Course, error) {
	if err := r.db.Save(&course).Error; err != nil {
		return course, err
	}
	return course, nil
}

// Delete marks a course as inactive (soft delete)
func (r *CourseRepository) Delete(id uint) error {
	return r.db.Model(&models.Course{}).Where("id = ?", id).Update("active", false).Error
}
