package usuarios

import (
	"context"
	"fmt"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// usuarioService implementa a interface Service
type usuarioService struct {
	usuarioRepo repository.UsuarioRepository
}

// NewUsuarioService cria uma nova instância do serviço de usuários
func NewUsuarioService(usuarioRepo repository.UsuarioRepository) Service {
	return &usuarioService{
		usuarioRepo: usuarioRepo,
	}
}

// Authenticate autentica um usuário com email e senha
func (s *usuarioService) Authenticate(ctx context.Context, email, password string) (*models.Usuario, error) {
	// Buscar usuário pelo email
	user, err := s.usuarioRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar usuário: %w", err)
	}

	if user == nil {
		return nil, fmt.Errorf("usuário não encontrado")
	}

	// Verificar se o usuário está ativo
	if !user.Ativo {
		return nil, fmt.Errorf("usuário inativo")
	}

	// Comparar senha
	err = bcrypt.CompareHashAndPassword([]byte(user.Senha), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("senha incorreta")
	}

	// Carregar perfis do usuário
	perfis, err := s.usuarioRepo.GetUserProfiles(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("erro ao carregar perfis: %w", err)
	}

	user.Perfis = perfis

	return user, nil
}

// GetUserByID obtém um usuário pelo ID
func (s *usuarioService) GetUserByID(ctx context.Context, id uint) (*models.Usuario, error) {
	user, err := s.usuarioRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar usuário: %w", err)
	}

	if user == nil {
		return nil, fmt.Errorf("usuário não encontrado")
	}

	// Carregar perfis do usuário
	perfis, err := s.usuarioRepo.GetUserProfiles(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("erro ao carregar perfis: %w", err)
	}

	user.Perfis = perfis

	return user, nil
}

// GetUserByEmail obtém um usuário pelo email
func (s *usuarioService) GetUserByEmail(ctx context.Context, email string) (*models.Usuario, error) {
	user, err := s.usuarioRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar usuário: %w", err)
	}

	if user == nil {
		return nil, fmt.Errorf("usuário não encontrado")
	}

	// Carregar perfis do usuário
	perfis, err := s.usuarioRepo.GetUserProfiles(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("erro ao carregar perfis: %w", err)
	}

	user.Perfis = perfis

	return user, nil
}

// CreateUser cria um novo usuário
func (s *usuarioService) CreateUser(ctx context.Context, user *models.Usuario) error {
	// Verificar campos obrigatórios
	if user.Nome == "" || user.Email == "" || user.Senha == "" {
		return fmt.Errorf("nome, email e senha são obrigatórios")
	}

	// Verificar se já existe usuário com o mesmo email
	existente, err := s.usuarioRepo.FindByEmail(ctx, user.Email)
	if err != nil {
		return fmt.Errorf("erro ao verificar email existente: %w", err)
	}

	if existente != nil {
		return fmt.Errorf("já existe um usuário com este email")
	}

	// Hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Senha), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("erro ao gerar hash da senha: %w", err)
	}

	user.Senha = string(hashedPassword)

	// Definir status padrão
	if !user.Ativo {
		user.Ativo = true
	}

	// Criar usuário
	err = s.usuarioRepo.Create(ctx, user)
	if err != nil {
		return fmt.Errorf("erro ao criar usuário: %w", err)
	}

	return nil
}

// UpdateUser atualiza um usuário existente
func (s *usuarioService) UpdateUser(ctx context.Context, user *models.Usuario) error {
	// Verificar se o usuário existe
	existente, err := s.usuarioRepo.FindByID(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("erro ao verificar usuário existente: %w", err)
	}

	if existente == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	// Verificar alteração de email
	if user.Email != existente.Email {
		emailExistente, err := s.usuarioRepo.FindByEmail(ctx, user.Email)
		if err != nil {
			return fmt.Errorf("erro ao verificar email existente: %w", err)
		}

		if emailExistente != nil && emailExistente.ID != user.ID {
			return fmt.Errorf("já existe outro usuário com este email")
		}
	}

	// Verificar alteração de senha
	if user.Senha != "" && user.Senha != existente.Senha {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Senha), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("erro ao gerar hash da senha: %w", err)
		}

		user.Senha = string(hashedPassword)
	} else {
		user.Senha = existente.Senha
	}

	// Atualizar usuário
	err = s.usuarioRepo.Update(ctx, user)
	if err != nil {
		return fmt.Errorf("erro ao atualizar usuário: %w", err)
	}

	return nil
}

// DeleteUser exclui um usuário
func (s *usuarioService) DeleteUser(ctx context.Context, id uint) error {
	// Verificar se o usuário existe
	existente, err := s.usuarioRepo.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("erro ao verificar usuário existente: %w", err)
	}

	if existente == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	// Excluir usuário (soft delete)
	err = s.usuarioRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("erro ao excluir usuário: %w", err)
	}

	return nil
}

// UpdateLastLogin atualiza a data do último login
func (s *usuarioService) UpdateLastLogin(ctx context.Context, id uint) error {
	now := time.Now()
	err := s.usuarioRepo.UpdateLastLogin(ctx, id, now)
	if err != nil {
		return fmt.Errorf("erro ao atualizar último login: %w", err)
	}

	return nil
}
