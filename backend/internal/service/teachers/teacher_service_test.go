package teachers

import (
	"context"
	"testing"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// MockUserRepository is a mock implementation of repository.UserRepository
type MockUserRepository struct {
	users          map[uint]*models.User
	usersByEmail   map[string]*models.User
	usersByProfile map[string][]models.User
	createErr      error
	findErr        error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users:          make(map[uint]*models.User),
		usersByEmail:   make(map[string]*models.User),
		usersByProfile: make(map[string][]models.User),
	}
}

func (m *MockUserRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	user, ok := m.users[id]
	if !ok {
		return nil, nil
	}
	return user, nil
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	user, ok := m.usersByEmail[email]
	if !ok {
		return nil, nil
	}
	return user, nil
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
	if m.createErr != nil {
		return m.createErr
	}
	user.ID = uint(len(m.users) + 1)
	m.users[user.ID] = user
	m.usersByEmail[user.Email] = user
	return nil
}

func (m *MockUserRepository) Update(ctx context.Context, user *models.User) error {
	m.users[user.ID] = user
	m.usersByEmail[user.Email] = user
	return nil
}

func (m *MockUserRepository) Delete(ctx context.Context, id uint) error {
	delete(m.users, id)
	return nil
}

func (m *MockUserRepository) GetUserProfiles(ctx context.Context, userID uint) ([]models.UserProfile, error) {
	return nil, nil
}

func (m *MockUserRepository) UpdateLastLogin(ctx context.Context, id uint, timestamp time.Time) error {
	return nil
}

func (m *MockUserRepository) FindByProfile(ctx context.Context, profile string) ([]models.User, error) {
	return nil, nil
}

func TestCreateProfessor(t *testing.T) {
	repo := NewMockUserRepository()
	// We pass nil for keycloak and email service since they are concrete types and not easily mockable without interfaces
	// The CreateProfessor code handles nil checks for these.
	svc := NewService(repo, nil, nil)

	t.Run("Success", func(t *testing.T) {
		professor := &models.User{
			Name:  "Test Professor",
			Email: "test@professor.com",
		}

		err := svc.CreateProfessor(context.Background(), professor)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if professor.ID == 0 {
			t.Errorf("Expected professor ID to be set")
		}

		if professor.ProfileID != 2 {
			t.Errorf("Expected profile ID to be 2 (teacher), got %d", professor.ProfileID)
		}

		if !professor.Active {
			t.Errorf("Expected professor to be active")
		}
	})

	t.Run("MissingRequiredFields", func(t *testing.T) {
		professor := &models.User{
			Name: "",
		}

		err := svc.CreateProfessor(context.Background(), professor)
		if err == nil {
			t.Fatal("Expected error for missing fields, got nil")
		}
	})

	t.Run("DuplicateEmail", func(t *testing.T) {
		professor1 := &models.User{
			Name:  "Prof 1",
			Email: "duplicate@test.com",
		}
		repo.Create(context.Background(), professor1)

		professor2 := &models.User{
			Name:  "Prof 2",
			Email: "duplicate@test.com",
		}

		err := svc.CreateProfessor(context.Background(), professor2)
		if err == nil {
			t.Fatal("Expected error for duplicate email, got nil")
		}
		if err.Error() != "a user with this email already exists" {
			t.Errorf("Expected specific error message, got %v", err)
		}
	})
}
