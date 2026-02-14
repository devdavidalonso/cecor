package professors

import (
	"context"
	"fmt"
	"strings"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
	"github.com/devdavidalonso/cecor/backend/internal/service"
)

// Service defines the professor service interface
type Service interface {
	CreateProfessor(ctx context.Context, professor *models.User) error
	GetProfessors(ctx context.Context) ([]models.User, error)
	GetProfessorByID(ctx context.Context, id uint) (*models.User, error)
	UpdateProfessor(ctx context.Context, professor *models.User) error
	DeleteProfessor(ctx context.Context, id uint) error
}

// professorService implements the Service interface
type professorService struct {
	userRepo repository.UserRepository
	keycloak *service.KeycloakService
	email    *service.EmailService
}

// NewService creates a new instance of professorService
func NewService(userRepo repository.UserRepository, keycloak *service.KeycloakService, email *service.EmailService) Service {
	return &professorService{
		userRepo: userRepo,
		keycloak: keycloak,
		email:    email,
	}
}

// CreateProfessor creates a new professor
func (s *professorService) CreateProfessor(ctx context.Context, professor *models.User) error {
	// Validate required fields
	if professor.Name == "" || professor.Email == "" {
		return fmt.Errorf("name and email are required")
	}

	// Set profile
	professor.Profile = "teacher"
	professor.Active = true

	// Check if user already exists
	existing, err := s.userRepo.FindByEmail(ctx, professor.Email)
	if err != nil {
		return fmt.Errorf("error checking existing email: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("a user with this email already exists")
	}

	// Create user in database
	// Set placeholder password
	professor.Password = "temp123456"

	if err := s.userRepo.Create(ctx, professor); err != nil {
		return fmt.Errorf("error creating professor in database: %w", err)
	}

	// Create in Keycloak
	if s.keycloak != nil {
		// Generate temporary password
		tempPassword := "prof123" // Or generate random

		// Create user
		// Split name
		nameParts := strings.Fields(professor.Name)
		firstName := nameParts[0]
		lastName := ""
		if len(nameParts) > 1 {
			lastName = strings.Join(nameParts[1:], " ")
		}

		req := service.CreateUserRequest{
			Username:      professor.Email,
			Email:         professor.Email,
			FirstName:     firstName,
			LastName:      lastName,
			Enabled:       true,
			EmailVerified: true, // Auto-verify for simplicity
		}

		keycloakID, err := s.keycloak.CreateUser(ctx, req)
		if err != nil {
			fmt.Printf("Warning: failed to create Keycloak user: %v\n", err)
		} else {
			// Assign role
			if err := s.keycloak.AssignRole(ctx, keycloakID, "professor"); err != nil {
				fmt.Printf("Warning: failed to assign role: %v\n", err)
			}

			// Set password
			if err := s.keycloak.SetTemporaryPassword(ctx, keycloakID, tempPassword); err != nil {
				fmt.Printf("Warning: failed to set password: %v\n", err)
			}

			// Update user with Keycloak ID
			professor.KeycloakUserID = &keycloakID
			s.userRepo.Update(ctx, professor)

			// Send email
			if s.email != nil {
				s.email.SendWelcomeEmail(professor.Email, professor.Name, tempPassword)
			}
		}
	}

	return nil
}

// GetProfessors returns all professors
func (s *professorService) GetProfessors(ctx context.Context) ([]models.User, error) {
	return s.userRepo.FindByProfile(ctx, "teacher")
}

// GetProfessorByID returns a professor by ID
func (s *professorService) GetProfessorByID(ctx context.Context, id uint) (*models.User, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("professor not found")
	}
	if user.Profile != "teacher" {
		return nil, fmt.Errorf("user is not a professor")
	}
	return user, nil
}

// UpdateProfessor updates a professor
func (s *professorService) UpdateProfessor(ctx context.Context, professor *models.User) error {
	existing, err := s.GetProfessorByID(ctx, professor.ID)
	if err != nil {
		return err
	}

	// Update allowed fields
	existing.Name = professor.Name
	existing.Phone = professor.Phone
	existing.CPF = professor.CPF

	return s.userRepo.Update(ctx, existing)
}

// DeleteProfessor deletes a professor
func (s *professorService) DeleteProfessor(ctx context.Context, id uint) error {
	// Check if exists
	_, err := s.GetProfessorByID(ctx, id)
	if err != nil {
		return err
	}

	// Disable in Keycloak if needed (omitted for brevity)

	return s.userRepo.Delete(ctx, id)
}
