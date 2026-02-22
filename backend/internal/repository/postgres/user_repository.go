package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

// userRepository implements the repository.UserRepository interface for PostgreSQL
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new instance of repository.UserRepository
func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return &userRepository{
		db: db,
	}
}

// FindByID finds a user by ID
func (r *userRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
	var user models.User

	result := r.db.WithContext(ctx).
		Where("id = ? AND deleted_at IS NULL", id).
		First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Returns nil without error when not found
		}
		return nil, fmt.Errorf("error finding user by ID: %w", result.Error)
	}

	return &user, nil
}

// Preload Address and UserContacts for GetProfessorByID inside the service
func (r *userRepository) FindByIDWithAssociations(ctx context.Context, id uint) (*models.User, error) {
	var user models.User

	result := r.db.WithContext(ctx).
		Preload("Address").
		Preload("UserContacts").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error finding user by ID: %w", result.Error)
	}

	return &user, nil
}

// FindByEmail finds a user by email
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User

	// Criar um novo contexto com timeout maior (30 segundos)
	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	result := r.db.WithContext(timeoutCtx).
		Where("LOWER(email) = LOWER(?) AND deleted_at IS NULL", email).
		First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Returns nil without error when not found
		}
		return nil, fmt.Errorf("error finding user by email: %w", result.Error)
	}

	return &user, nil
}

// Create creates a new user
func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	result := r.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			if strings.Contains(result.Error.Error(), "email") {
				return fmt.Errorf("a user with this email already exists")
			}
			if strings.Contains(result.Error.Error(), "cpf") {
				return fmt.Errorf("a user with this CPF already exists")
			}
			return fmt.Errorf("uniqueness violation: %w", result.Error)
		}
		return fmt.Errorf("error creating user: %w", result.Error)
	}

	// Compatibilidade com schema legado: coluna users.profile (texto) obrigatória.
	// Mantemos profile_id como fonte principal e sincronizamos profile textual.
	profileText := profileTextFromID(user.ProfileID)
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", user.ID).
		Update("profile", profileText).Error; err != nil {
		return fmt.Errorf("error syncing legacy profile text: %w", err)
	}

	return nil
}

// Update updates an existing user
func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	result := r.db.WithContext(ctx).Model(user).Updates(user)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			if strings.Contains(result.Error.Error(), "email") {
				return fmt.Errorf("another user with this email already exists")
			}
			if strings.Contains(result.Error.Error(), "cpf") {
				return fmt.Errorf("another user with this CPF already exists")
			}
			return fmt.Errorf("uniqueness violation: %w", result.Error)
		}
		return fmt.Errorf("error updating user: %w", result.Error)
	}

	// Sync coluna legado users.profile para evitar inconsistencias em bancos antigos.
	profileText := profileTextFromID(user.ProfileID)
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", user.ID).
		Update("profile", profileText).Error; err != nil {
		return fmt.Errorf("error syncing legacy profile text: %w", err)
	}

	return nil
}

// UpdateWithAssociations updates an existing user and replaces Address and UserContacts
func (r *userRepository) UpdateWithAssociations(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. Atualiza campos normais do usuario
		if err := tx.Model(user).Updates(user).Error; err != nil {
			if strings.Contains(err.Error(), "unique constraint") {
				return fmt.Errorf("uniqueness violation: %w", err)
			}
			return fmt.Errorf("error updating user: %w", err)
		}

		// 2. Substitui ou atualiza o Endereço
		if user.Address != nil {
			if err := tx.Model(user).Association("Address").Replace(user.Address); err != nil {
				return fmt.Errorf("error replacing address: %w", err)
			}
		} else {
			// Opcional: remover endereco se nil
			tx.Model(user).Association("Address").Clear()
		}

		// 3. Substitui os Contatos de Emergência
		if user.UserContacts != nil {
			if err := tx.Model(user).Association("UserContacts").Replace(user.UserContacts); err != nil {
				return fmt.Errorf("error replacing contacts: %w", err)
			}
		}

		return nil
	})
}

// Delete removes a user (soft delete)
func (r *userRepository) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Update("deleted_at", time.Now())

	if result.Error != nil {
		return fmt.Errorf("error deleting user: %w", result.Error)
	}

	return nil
}

// GetUserProfiles gets the profiles of a user (legacy - now returns single profile based on ProfileID)
func (r *userRepository) GetUserProfiles(ctx context.Context, userID uint) ([]models.UserProfile, error) {
	var profiles []models.UserProfile

	// First get the user to find their ProfileID
	var user models.User
	result := r.db.WithContext(ctx).Select("profile_id").Where("id = ?", userID).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return profiles, nil // Return empty if user not found
		}
		return nil, fmt.Errorf("error finding user: %w", result.Error)
	}

	// Get the profile
	var profile models.UserProfile
	result = r.db.WithContext(ctx).Where("id = ?", user.ProfileID).First(&profile)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return profiles, nil // Return empty if profile not found
		}
		return nil, fmt.Errorf("error finding profile: %w", result.Error)
	}

	profiles = append(profiles, profile)
	return profiles, nil
}

// FindProfileByID finds a profile by ID
func (r *userRepository) FindProfileByID(ctx context.Context, id uint) (*models.UserProfile, error) {
	var profile models.UserProfile

	result := r.db.WithContext(ctx).Where("id = ?", id).First(&profile)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("error finding profile by ID: %w", result.Error)
	}

	return &profile, nil
}

// UpdateLastLogin updates the last login date
func (r *userRepository) UpdateLastLogin(ctx context.Context, id uint, timestamp time.Time) error {
	result := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Update("last_login", timestamp)

	if result.Error != nil {
		return fmt.Errorf("error updating last login: %w", result.Error)
	}

	return nil
}

// FindByProfile finds users by profile name (legacy - maps name to ID)
func (r *userRepository) FindByProfile(ctx context.Context, profile string) ([]models.User, error) {
	// Map profile name to ID
	var profileID uint
	switch profile {
	case "admin":
		profileID = 1
	case "teacher", "professor":
		profileID = 2
	case "student":
		profileID = 3
	default:
		profileID = 3 // Default to student
	}

	return r.FindByProfileID(ctx, profileID)
}

func profileTextFromID(profileID uint) string {
	switch profileID {
	case 1:
		return "admin"
	case 2:
		return "professor"
	case 3:
		return "student"
	default:
		return "student"
	}
}

// FindByProfileID finds users by profile ID
func (r *userRepository) FindByProfileID(ctx context.Context, profileID uint) ([]models.User, error) {
	var users []models.User

	result := r.db.WithContext(ctx).
		Where("profile_id = ? AND deleted_at IS NULL", profileID).
		Find(&users)

	if result.Error != nil {
		return nil, fmt.Errorf("error finding users by profile ID: %w", result.Error)
	}

	return users, nil
}
