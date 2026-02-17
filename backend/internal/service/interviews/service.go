package interviews

import (
	"context"
	"errors"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository/mongodb"
)

type Service interface {
	GetPendingInterview(ctx context.Context, studentID uint) (*models.FormDefinition, error)
	SubmitResponse(ctx context.Context, response *models.InterviewResponse) error
}

type service struct {
	repo mongodb.FormRepository
}

func NewService() Service {
	return &service{
		repo: mongodb.NewFormRepository(),
	}
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

	// 1. Validate against form definition (Simplified for MVP)
	// In production, fetch form and check required fields

	response.Status = "completed"
	return s.repo.SaveResponse(ctx, response)
}
