package courses

import (
	"context"
	"fmt"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

type Service interface {
	CreateCourse(ctx context.Context, course *models.Course) error
	GetCourseByID(ctx context.Context, id uint) (*models.Course, error)
	ListCourses(ctx context.Context) ([]models.Course, error)
	UpdateCourse(ctx context.Context, course *models.Course) error
	DeleteCourse(ctx context.Context, id uint) error
}

type service struct {
	repo repository.CourseRepository
}

func NewService(repo repository.CourseRepository) Service {
	return &service{repo: repo}
}

func (s *service) CreateCourse(ctx context.Context, course *models.Course) error {
	if course.Name == "" {
		return fmt.Errorf("course name is required")
	}
	return s.repo.Create(ctx, course)
}

func (s *service) GetCourseByID(ctx context.Context, id uint) (*models.Course, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *service) ListCourses(ctx context.Context) ([]models.Course, error) {
	return s.repo.FindAll(ctx)
}

func (s *service) UpdateCourse(ctx context.Context, course *models.Course) error {
	return s.repo.Update(ctx, course)
}

func (s *service) DeleteCourse(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}
