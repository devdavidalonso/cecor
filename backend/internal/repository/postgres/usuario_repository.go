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

// usuarioRepository implementa a interface repository.UsuarioRepository para PostgreSQL
type usuarioRepository struct {
	db *gorm.DB
}

// NewUsuarioRepository cria uma nova instância de repository.UsuarioRepository
func NewUsuarioRepository(db *gorm.DB) repository.UsuarioRepository {
	return &usuarioRepository{
		db: db,
	}
}

// FindByID busca um usuário pelo ID
func (r *usuarioRepository) FindByID(ctx context.Context, id uint) (*models.Usuario, error) {
	var usuario models.Usuario

	result := r.db.WithContext(ctx).
		Where("id = ? AND excluido_em IS NULL", id).
		First(&usuario)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Retorna nil sem erro quando não encontra
		}
		return nil, fmt.Errorf("erro ao buscar usuário por ID: %w", result.Error)
	}

	return &usuario, nil
}

// FindByEmail busca um usuário pelo email
func (r *usuarioRepository) FindByEmail(ctx context.Context, email string) (*models.Usuario, error) {
	var usuario models.Usuario

	result := r.db.WithContext(ctx).
		Where("LOWER(email) = LOWER(?) AND excluido_em IS NULL", email).
		First(&usuario)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Retorna nil sem erro quando não encontra
		}
		return nil, fmt.Errorf("erro ao buscar usuário por email: %w", result.Error)
	}

	return &usuario, nil
}

// Create cria um novo usuário
func (r *usuarioRepository) Create(ctx context.Context, usuario *models.Usuario) error {
	result := r.db.WithContext(ctx).Create(usuario)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			if strings.Contains(result.Error.Error(), "email") {
				return fmt.Errorf("já existe um usuário com este email")
			}
			if strings.Contains(result.Error.Error(), "cpf") {
				return fmt.Errorf("já existe um usuário com este CPF")
			}
			return fmt.Errorf("violação de unicidade: %w", result.Error)
		}
		return fmt.Errorf("erro ao criar usuário: %w", result.Error)
	}

	return nil
}

// Update atualiza um usuário existente
func (r *usuarioRepository) Update(ctx context.Context, usuario *models.Usuario) error {
	result := r.db.WithContext(ctx).Model(usuario).Updates(usuario)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			if strings.Contains(result.Error.Error(), "email") {
				return fmt.Errorf("já existe outro usuário com este email")
			}
			if strings.Contains(result.Error.Error(), "cpf") {
				return fmt.Errorf("já existe outro usuário com este CPF")
			}
			return fmt.Errorf("violação de unicidade: %w", result.Error)
		}
		return fmt.Errorf("erro ao atualizar usuário: %w", result.Error)
	}

	return nil
}

// Delete exclui um usuário (soft delete)
func (r *usuarioRepository) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).
		Model(&models.Usuario{}).
		Where("id = ?", id).
		Update("excluido_em", time.Now())

	if result.Error != nil {
		return fmt.Errorf("erro ao excluir usuário: %w", result.Error)
	}

	return nil
}

// GetUserProfiles obtém os perfis de um usuário
func (r *usuarioRepository) GetUserProfiles(ctx context.Context, usuarioID uint) ([]models.PerfilUsuario, error) {
	var perfis []models.PerfilUsuario

	result := r.db.WithContext(ctx).
		Where("usuario_id = ? AND ativo = true", usuarioID).
		Order("principal DESC, data_inicio DESC"). // Ordenar por principal (true primeiro) e data de início (mais recente primeiro)
		Find(&perfis)

	if result.Error != nil {
		return nil, fmt.Errorf("erro ao buscar perfis do usuário: %w", result.Error)
	}

	return perfis, nil
}

// UpdateLastLogin atualiza a data do último login
func (r *usuarioRepository) UpdateLastLogin(ctx context.Context, id uint, timestamp time.Time) error {
	result := r.db.WithContext(ctx).
		Model(&models.Usuario{}).
		Where("id = ?", id).
		Update("ultimo_login", timestamp)

	if result.Error != nil {
		return fmt.Errorf("erro ao atualizar último login: %w", result.Error)
	}

	return nil
}
