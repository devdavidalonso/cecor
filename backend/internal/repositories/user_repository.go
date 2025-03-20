// internal/repositories/user_repository.go
package repositories

import (
	"errors"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// UserRepository encapsula as operações de banco de dados para usuários
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository cria uma nova instância de UserRepository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db}
}

// FindAll retorna todos os usuários ativos
func (r *UserRepository) FindAll() ([]models.User, error) {
	var users []models.User
	result := r.db.Where("active = ?", true).Find(&users)
	return users, result.Error
}

// FindByID retorna um usuário pelo ID
func (r *UserRepository) FindByID(id uint) (models.User, error) {
	var user models.User
	result := r.db.First(&user, id)
	return user, result.Error
}

// FindByEmail retorna um usuário pelo email
func (r *UserRepository) FindByEmail(email string) (models.User, error) {
	var user models.User
	result := r.db.Where("email = ? AND active = ?", email, true).First(&user)
	return user, result.Error
}

// ExistsByEmail verifica se existe um usuário com o email informado
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	result := r.db.Model(&models.User{}).Where("email = ? AND active = ?", email, true).Count(&count)
	return count > 0, result.Error
}

// FindByProfile retorna usuários pelo perfil (aluno, professor, admin)
func (r *UserRepository) FindByProfile(profile string) ([]models.User, error) {
	var users []models.User
	result := r.db.Where("profile = ? AND active = ?", profile, true).Find(&users)
	return users, result.Error
}

// Create cria um novo usuário
func (r *UserRepository) Create(user models.User) (models.User, error) {
	// Verificar se já existe um usuário com o mesmo email
	exists, err := r.ExistsByEmail(user.Email)
	if err != nil {
		return models.User{}, err
	}
	if exists {
		return models.User{}, errors.New("email já cadastrado")
	}

	// Definir dados de auditoria
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	// Criar o usuário
	result := r.db.Create(&user)
	return user, result.Error
}

// Update atualiza um usuário existente
func (r *UserRepository) Update(user *models.User) error {
	// Não permitir alteração de email para um email já existente de outro usuário
	if user.Email != "" {
		var count int64
		r.db.Model(&models.User{}).Where("email = ? AND id != ? AND active = ?", user.Email, user.ID, true).Count(&count)
		if count > 0 {
			return errors.New("email já está em uso por outro usuário")
		}
	}

	// Atualizar dados de auditoria
	user.UpdatedAt = time.Now()

	// Atualizar usuário
	return r.db.Save(user).Error
}

// Delete realiza uma exclusão lógica (soft delete) de um usuário
func (r *UserRepository) Delete(id uint) error {
	// Verificar se o usuário existe
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		return err
	}

	// Soft delete
	now := time.Now()
	user.DeletedAt = &now
	user.Active = false
	user.UpdatedAt = time.Now()

	return r.db.Save(&user).Error
}

// HardDelete remove permanentemente um usuário do banco de dados
// Atenção: Use com cuidado, pois pode violar a integridade referencial
func (r *UserRepository) HardDelete(id uint) error {
	return r.db.Unscoped().Delete(&models.User{}, id).Error
}

// Restore restaura um usuário que foi excluído logicamente
func (r *UserRepository) Restore(id uint) error {
	var user models.User
	// Buscar usuário excluído
	if err := r.db.Unscoped().First(&user, id).Error; err != nil {
		return err
	}

	// Verificar se já foi excluído
	if user.DeletedAt == nil {
		return errors.New("usuário não está excluído")
	}

	// Restaurar
	user.DeletedAt = nil
	user.Active = true
	user.UpdatedAt = time.Now()

	return r.db.Save(&user).Error
}

// Search busca usuários com filtros
func (r *UserRepository) Search(params map[string]interface{}) ([]models.User, error) {
	var users []models.User
	query := r.db.Where("active = ?", true)

	// Aplicar filtros se fornecidos
	if name, ok := params["name"].(string); ok && name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	if email, ok := params["email"].(string); ok && email != "" {
		query = query.Where("email LIKE ?", "%"+email+"%")
	}

	if profile, ok := params["profile"].(string); ok && profile != "" {
		query = query.Where("profile = ?", profile)
	}

	if cpf, ok := params["cpf"].(string); ok && cpf != "" {
		query = query.Where("cpf = ?", cpf)
	}

	// Executar a consulta
	result := query.Find(&users)
	return users, result.Error
}

// ChangePassword altera a senha de um usuário
func (r *UserRepository) ChangePassword(id uint, newPassword string) error {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		return err
	}

	user.Password = newPassword
	user.UpdatedAt = time.Now()

	return r.db.Save(&user).Error
}

// CountByProfile conta o número de usuários por perfil
func (r *UserRepository) CountByProfile(profile string) (int64, error) {
	var count int64
	result := r.db.Model(&models.User{}).Where("profile = ? AND active = ?", profile, true).Count(&count)
	return count, result.Error
}
