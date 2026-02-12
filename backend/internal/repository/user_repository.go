package repository

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// UserRepository defines the interface for user data access
type UserRepository interface {
	// FindByID finds a user by ID
	FindByID(ctx context.Context, id uint) (*models.User, error)

	// FindByEmail finds a user by email
	FindByEmail(ctx context.Context, email string) (*models.User, error)

	// Create creates a new user
	Create(ctx context.Context, user *models.User) error

	// Update updates an existing user
	Update(ctx context.Context, user *models.User) error

	// Delete performs a logical deletion of a user
	Delete(ctx context.Context, id uint) error

	// GetUserProfiles gets the profiles of a user
	GetUserProfiles(ctx context.Context, userID uint) ([]models.UserProfile, error)

	// UpdateLastLogin updates the last login date
	UpdateLastLogin(ctx context.Context, id uint, timestamp time.Time) error

	// FindByProfile finds users by profile
	FindByProfile(ctx context.Context, profile string) ([]models.User, error)
}
