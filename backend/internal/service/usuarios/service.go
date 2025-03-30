package usuarios

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// Service define a interface do serviço de usuários
type Service interface {
	// Authenticate autentica um usuário com email e senha
	Authenticate(ctx context.Context, email, password string) (*models.Usuario, error)

	// GetUserByID obtém um usuário pelo ID
	GetUserByID(ctx context.Context, id uint) (*models.Usuario, error)

	// GetUserByEmail obtém um usuário pelo email
	GetUserByEmail(ctx context.Context, email string) (*models.Usuario, error)

	// CreateUser cria um novo usuário
	CreateUser(ctx context.Context, user *models.Usuario) error

	// UpdateUser atualiza um usuário existente
	UpdateUser(ctx context.Context, user *models.Usuario) error

	// DeleteUser exclui um usuário
	DeleteUser(ctx context.Context, id uint) error

	// UpdateLastLogin atualiza a data do último login
	UpdateLastLogin(ctx context.Context, id uint) error
}
