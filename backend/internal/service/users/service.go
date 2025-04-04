// backend/internal/service/users/service.go
package users

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// Service defines the user service methods
type Service interface {
	// Authenticate authenticates a user with email and password
	Authenticate(ctx context.Context, email, password string) (*models.User, error)

	// GetUserByID gets a user by ID
	GetUserByID(ctx context.Context, id uint) (*models.User, error)

	// GetUserByEmail gets a user by email
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)

	// CreateUser creates a new user
	CreateUser(ctx context.Context, user *models.User) error

	// UpdateUser updates an existing user
	UpdateUser(ctx context.Context, user *models.User) error

	// DeleteUser deletes a user
	DeleteUser(ctx context.Context, id uint) error

	// UpdateLastLogin updates the last login timestamp
	UpdateLastLogin(ctx context.Context, id uint) error
}
