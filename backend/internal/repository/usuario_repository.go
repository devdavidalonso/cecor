package repository

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// UsuarioRepository define a interface para acesso aos dados de usuários
type UsuarioRepository interface {
	// FindByID busca um usuário pelo ID
	FindByID(ctx context.Context, id uint) (*models.Usuario, error)

	// FindByEmail busca um usuário pelo email
	FindByEmail(ctx context.Context, email string) (*models.Usuario, error)

	// Create cria um novo usuário
	Create(ctx context.Context, usuario *models.Usuario) error

	// Update atualiza um usuário existente
	Update(ctx context.Context, usuario *models.Usuario) error

	// Delete exclui um usuário (soft delete)
	Delete(ctx context.Context, id uint) error

	// GetUserProfiles obtém os perfis de um usuário
	GetUserProfiles(ctx context.Context, usuarioID uint) ([]models.PerfilUsuario, error)

	// UpdateLastLogin atualiza a data do último login
	UpdateLastLogin(ctx context.Context, id uint, timestamp time.Time) error
}
