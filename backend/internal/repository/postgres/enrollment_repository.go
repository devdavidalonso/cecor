package postgres

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
	"gorm.io/gorm"
)

type enrollmentRepository struct {
	db *gorm.DB
}

func NewEnrollmentRepository(db *gorm.DB) repository.EnrollmentRepository {
	return &enrollmentRepository{db: db}
}

func (r *enrollmentRepository) Create(ctx context.Context, enrollment *models.Enrollment) error {
	return r.db.WithContext(ctx).Create(enrollment).Error
}

func (r *enrollmentRepository) FindByID(ctx context.Context, id uint) (*models.Enrollment, error) {
	var enrollment models.Enrollment
	if err := r.db.WithContext(ctx).First(&enrollment, id).Error; err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *enrollmentRepository) FindByStudentAndCourse(ctx context.Context, studentID, courseID uint) (*models.Enrollment, error) {
	var enrollment models.Enrollment
	if err := r.db.WithContext(ctx).Where("student_id = ? AND course_id = ?", studentID, courseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &enrollment, nil
}

func (r *enrollmentRepository) FindAll(ctx context.Context) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	if err := r.db.WithContext(ctx).Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}

func (r *enrollmentRepository) ListByCourse(ctx context.Context, courseID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	if err := r.db.WithContext(ctx).Where("course_id = ?", courseID).Find(&enrollments).Error; err != nil {
		return nil, err
	}
	return enrollments, nil
}

func (r *enrollmentRepository) Update(ctx context.Context, enrollment *models.Enrollment) error {
	return r.db.WithContext(ctx).Save(enrollment).Error
}

func (r *enrollmentRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Enrollment{}, id).Error
}
