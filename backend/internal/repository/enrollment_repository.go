package repository

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

type EnrollmentRepository interface {
	Create(ctx context.Context, enrollment *models.Enrollment) error
	FindByID(ctx context.Context, id uint) (*models.Enrollment, error)
	FindByStudentAndCourse(ctx context.Context, studentID, courseID uint) (*models.Enrollment, error)
	FindAll(ctx context.Context) ([]models.Enrollment, error)
	ListByCourse(ctx context.Context, courseID uint) ([]models.Enrollment, error)
	Update(ctx context.Context, enrollment *models.Enrollment) error
	Delete(ctx context.Context, id uint) error
}
