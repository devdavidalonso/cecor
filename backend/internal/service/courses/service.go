package courses

import (
	"context"
	"fmt"

	"github.com/devdavidalonso/cecor/backend/internal/infrastructure/googleapis"
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
	repo            repository.CourseRepository
	classroomClient googleapis.GoogleClassroomClient
}

func NewService(repo repository.CourseRepository, classroomClient googleapis.GoogleClassroomClient) Service {
	return &service{
		repo:            repo,
		classroomClient: classroomClient,
	}
}

func (s *service) CreateCourse(ctx context.Context, course *models.Course) error {
	if course.Name == "" {
		return fmt.Errorf("course name is required")
	}

	// Create course in Google Classroom first (if client is configured)
	if s.classroomClient != nil {
		googleCourse, err := s.classroomClient.CreateCourse(
			course.Name,
			course.DifficultyLevel,
			"About the Course",
			course.ShortDescription,
		)
		if err != nil {
			fmt.Printf("Warning: Failed to create Google Classroom course: %v\n", err)
			// Decide if this should block the DB creation. For POC, we just log and continue or return error
			// Let's return error to enforce the sync.
			return fmt.Errorf("failed to create Google Classroom course: %w", err)
		}

		fmt.Printf("Google Classroom course created! Alternate link: %s\n", googleCourse.AlternateLink)
		course.GoogleClassroomURL = googleCourse.AlternateLink
		course.GoogleClassroomID = googleCourse.Id
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
