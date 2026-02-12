package matriculas

import (
	"context"
	"fmt"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

type Service interface {
	EnrollStudent(ctx context.Context, enrollment *models.Enrollment) error
	GetEnrollment(ctx context.Context, id uint) (*models.Enrollment, error)
	ListEnrollments(ctx context.Context) ([]models.Enrollment, error)
	ListByCourse(ctx context.Context, courseID uint) ([]models.Enrollment, error)
	UpdateEnrollment(ctx context.Context, enrollment *models.Enrollment) error
	DeleteEnrollment(ctx context.Context, id uint) error
}

type service struct {
	repo repository.EnrollmentRepository
}

func NewService(repo repository.EnrollmentRepository) Service {
	return &service{repo: repo}
}

func (s *service) EnrollStudent(ctx context.Context, enrollment *models.Enrollment) error {
	// 1. Check if student is already enrolled in this course
	existing, err := s.repo.FindByStudentAndCourse(ctx, enrollment.StudentID, enrollment.CourseID)
	if err != nil {
		return fmt.Errorf("failed to check existing enrollment: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("student is already enrolled in this course")
	}

	// 2. Generate Enrollment Number if not provided
	if enrollment.EnrollmentNumber == "" {
		enrollment.EnrollmentNumber = fmt.Sprintf("MAT-%d-%d", enrollment.StudentID, time.Now().Unix())
	}

	// 3. Set default dates if not provided
	if enrollment.EnrollmentDate.IsZero() {
		enrollment.EnrollmentDate = time.Now()
	}
	if enrollment.StartDate.IsZero() {
		enrollment.StartDate = time.Now()
	}
	if enrollment.Status == "" {
		enrollment.Status = "active"
	}

	return s.repo.Create(ctx, enrollment)
}

func (s *service) GetEnrollment(ctx context.Context, id uint) (*models.Enrollment, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *service) ListEnrollments(ctx context.Context) ([]models.Enrollment, error) {
	return s.repo.FindAll(ctx)
}

func (s *service) ListByCourse(ctx context.Context, courseID uint) ([]models.Enrollment, error) {
	return s.repo.ListByCourse(ctx, courseID)
}

func (s *service) UpdateEnrollment(ctx context.Context, enrollment *models.Enrollment) error {
	return s.repo.Update(ctx, enrollment)
}

func (s *service) DeleteEnrollment(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}
