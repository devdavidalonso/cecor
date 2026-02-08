package repository

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

type CourseRepository interface {
	Create(ctx context.Context, course *models.Course) error
	FindByID(ctx context.Context, id uint) (*models.Course, error)
	FindAll(ctx context.Context) ([]models.Course, error)
	Update(ctx context.Context, course *models.Course) error
	Delete(ctx context.Context, id uint) error
}
