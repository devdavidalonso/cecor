package interviews

import (
	"context"
	"errors"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository/mongodb"
)

// AdminService gerencia formulários de entrevista (CRUD)
type AdminService interface {
	ListForms(ctx context.Context) ([]models.FormDefinition, error)
	GetForm(ctx context.Context, id string) (*models.FormDefinition, error)
	CreateForm(ctx context.Context, form *models.FormDefinition) error
	UpdateForm(ctx context.Context, id string, form *models.FormDefinition) error
	DeleteForm(ctx context.Context, id string) error
	ActivateForm(ctx context.Context, id string) error
	DeactivateForm(ctx context.Context, id string) error
	GetFormResponses(ctx context.Context, formVersion string) ([]models.InterviewResponse, error)
}

type adminService struct {
	repo mongodb.FormRepository
}

// NewAdminService cria uma nova instância do serviço admin
func NewAdminService(repo mongodb.FormRepository) AdminService {
	return &adminService{repo: repo}
}

func (s *adminService) ListForms(ctx context.Context) ([]models.FormDefinition, error) {
	return s.repo.ListAllForms(ctx)
}

func (s *adminService) GetForm(ctx context.Context, id string) (*models.FormDefinition, error) {
	if id == "" {
		return nil, errors.New("form ID is required")
	}
	return s.repo.GetFormByID(ctx, id)
}

func (s *adminService) CreateForm(ctx context.Context, form *models.FormDefinition) error {
	// Validações
	if form.Title == "" {
		return errors.New("form title is required")
	}
	if form.Version == "" {
		return errors.New("form version is required")
	}
	if len(form.Questions) == 0 {
		return errors.New("form must have at least one question")
	}

	// Validar cada pergunta
	for i, q := range form.Questions {
		if q.ID == "" {
			return errors.New("question ID is required for question " + string(rune(i)))
		}
		if q.Label == "" {
			return errors.New("question label is required for question " + q.ID)
		}
		if q.Type == "" {
			return errors.New("question type is required for question " + q.ID)
		}
		// Validar tipos permitidos
		validTypes := map[string]bool{
			"text":            true,
			"select":          true,
			"boolean":         true,
			"multiple_choice": true,
		}
		if !validTypes[q.Type] {
			return errors.New("invalid question type: " + q.Type)
		}
		// Se for select ou multiple_choice, deve ter opções
		if (q.Type == "select" || q.Type == "multiple_choice") && len(q.Options) == 0 {
			return errors.New("question " + q.ID + " must have options")
		}
	}

	return s.repo.CreateForm(ctx, form)
}

func (s *adminService) UpdateForm(ctx context.Context, id string, form *models.FormDefinition) error {
	if id == "" {
		return errors.New("form ID is required")
	}
	if form.Title == "" {
		return errors.New("form title is required")
	}

	// Verificar se o formulário existe
	existing, err := s.repo.GetFormByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("form not found")
	}

	return s.repo.UpdateForm(ctx, id, form)
}

func (s *adminService) DeleteForm(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("form ID is required")
	}

	// Verificar se o formulário existe
	existing, err := s.repo.GetFormByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("form not found")
	}

	return s.repo.DeleteForm(ctx, id)
}

func (s *adminService) ActivateForm(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("form ID is required")
	}
	return s.repo.UpdateFormStatus(ctx, id, true)
}

func (s *adminService) DeactivateForm(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("form ID is required")
	}
	return s.repo.UpdateFormStatus(ctx, id, false)
}

func (s *adminService) GetFormResponses(ctx context.Context, formVersion string) ([]models.InterviewResponse, error) {
	if formVersion == "" {
		return nil, errors.New("form version is required")
	}
	return s.repo.ListResponsesByForm(ctx, formVersion)
}
