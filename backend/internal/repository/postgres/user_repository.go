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

	return nil
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

// GetUserProfiles gets the profiles of a user
func (r *userRepository) GetUserProfiles(ctx context.Context, userID uint) ([]models.UserProfile, error) {
	var profiles []models.UserProfile

	result := r.db.WithContext(ctx).
		Where("user_id = ? AND is_active = true", userID).
		Order("is_primary DESC, start_date DESC"). // Order by primary (true first) and start date (most recent first)
		Find(&profiles)

	if result.Error != nil {
		return nil, fmt.Errorf("error finding user profiles: %w", result.Error)
	}

	return profiles, nil
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

// FindByProfile finds users by profile
func (r *userRepository) FindByProfile(ctx context.Context, profile string) ([]models.User, error) {
	var users []models.User

	result := r.db.WithContext(ctx).
		Where("profile = ? AND deleted_at IS NULL", profile).
		Find(&users)

	if result.Error != nil {
		return nil, fmt.Errorf("error finding users by profile: %w", result.Error)
	}

	return users, nil
}
