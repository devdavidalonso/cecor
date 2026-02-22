package interviews

import (
	"context"
	"errors"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository/mongodb"
)

// Service interface para operações de entrevista
type Service interface {
	GetPendingInterview(ctx context.Context, studentID uint) (*models.FormDefinition, error)
	SubmitResponse(ctx context.Context, response *models.InterviewResponse) error
	GetStudentInterview(ctx context.Context, studentID uint) (*models.InterviewResponse, error)
}

type service struct {
	repo mongodb.FormRepository
}

// NewService cria uma nova instância do serviço
func NewService(repo mongodb.FormRepository) Service {
	return &service{repo: repo}
}

func (s *service) GetPendingInterview(ctx context.Context, studentID uint) (*models.FormDefinition, error) {
	// 1. Check if student already responded
	response, err := s.repo.GetResponseByStudent(ctx, studentID)
	if err != nil {
		return nil, err
	}

	// If response exists and is completed, no pending interview
	if response != nil && response.Status == "completed" {
		return nil, nil
	}

	// 2. Get active form
	form, err := s.repo.GetActiveForm(ctx)
	if err != nil {
		return nil, err
	}

	return form, nil
}

func (s *service) SubmitResponse(ctx context.Context, response *models.InterviewResponse) error {
	if response.StudentID == 0 {
		return errors.New("student ID is required")
	}
	if len(response.Answers) == 0 {
		return errors.New("answers cannot be empty")
	}
	if response.FormVersion == "" {
		return errors.New("form version is required")
	}

	// 1. Validate against form definition (Simplified for MVP)
	// In production, fetch form and check required fields

	response.Status = "completed"
	return s.repo.SaveResponse(ctx, response)
}

func (s *service) GetStudentInterview(ctx context.Context, studentID uint) (*models.InterviewResponse, error) {
	if studentID == 0 {
		return nil, errors.New("student ID is required")
	}
	return s.repo.GetResponseByStudent(ctx, studentID)
}
