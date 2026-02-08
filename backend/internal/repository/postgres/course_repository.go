package postgres

import (
	"context"
	"fmt"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
	"gorm.io/gorm"
)

type courseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) repository.CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) Create(ctx context.Context, course *models.Course) error {
	if course.Tags == "" {
		course.Tags = "[]"
	}
	if err := r.db.WithContext(ctx).Create(course).Error; err != nil {
		return fmt.Errorf("failed to create course: %w", err)
	}
	return nil
}

func (r *courseRepository) FindByID(ctx context.Context, id uint) (*models.Course, error) {
	var course models.Course
	if err := r.db.WithContext(ctx).First(&course, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find course: %w", err)
	}
	return &course, nil
}

func (r *courseRepository) FindAll(ctx context.Context) ([]models.Course, error) {
	var courses []models.Course
	if err := r.db.WithContext(ctx).Find(&courses).Error; err != nil {
		return nil, fmt.Errorf("failed to list courses: %w", err)
	}
	return courses, nil
}

func (r *courseRepository) Update(ctx context.Context, course *models.Course) error {
	if course.Tags == "" {
		course.Tags = "[]"
	}
	if err := r.db.WithContext(ctx).Save(course).Error; err != nil {
		return fmt.Errorf("failed to update course: %w", err)
	}
	return nil
}

func (r *courseRepository) Delete(ctx context.Context, id uint) error {
	if err := r.db.WithContext(ctx).Delete(&models.Course{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete course: %w", err)
	}
	return nil
}
