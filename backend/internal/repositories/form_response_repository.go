// internal/repositories/form_response_repository.go
package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// FormResponseRepository implementa operações de banco de dados para respostas de formulários
type FormResponseRepository struct {
	db *gorm.DB
}

// NewFormResponseRepository cria uma nova instância de FormResponseRepository
func NewFormResponseRepository(db *gorm.DB) *FormResponseRepository {
	return &FormResponseRepository{db}
}

// Create cria uma nova resposta de formulário
func (r *FormResponseRepository) Create(response *models.FormResponse) error {
	return r.db.Create(response).Error
}

// CreateAnswerDetail cria um detalhe de resposta
func (r *FormResponseRepository) CreateAnswerDetail(detail *models.FormAnswerDetail) error {
	return r.db.Create(detail).Error
}

// FindByID retorna uma resposta pelo ID com seus detalhes
func (r *FormResponseRepository) FindByID(id uint) (models.FormResponse, error) {
	var response models.FormResponse
	if err := r.db.First(&response, id).Error; err != nil {
		return response, err
	}

	// Carregar detalhes das respostas
	if err := r.db.Where("response_id = ?", id).Find(&response.AnswerDetails).Error; err != nil {
		return response, err
	}

	return response, nil
}

// FindByUserID retorna todas as respostas de um usuário
func (r *FormResponseRepository) FindByUserID(userID uint) ([]models.FormResponse, error) {
	var responses []models.FormResponse
	if err := r.db.Where("user_id = ?", userID).Find(&responses).Error; err != nil {
		return nil, err
	}
	return responses, nil
}

// FindWithPagination retorna respostas com paginação e filtro opcional de formulário
func (r *FormResponseRepository) FindWithPagination(formID *uint, offset, limit int) ([]models.FormResponse, int, error) {
	var responses []models.FormResponse
	var count int64

	query := r.db.Model(&models.FormResponse{})

	// Aplicar filtro de formulário se fornecido
	if formID != nil {
		query = query.Where("form_id = ?", *formID)
	}

	// Contar total antes de aplicar paginação
	query.Count(&count)

	// Aplicar paginação e buscar resultados
	if err := query.Offset(offset).Limit(limit).Find(&responses).Error; err != nil {
		return nil, 0, err
	}

	return responses, int(count), nil
}

// ExistsByFormID verifica se existem respostas para um formulário
func (r *FormResponseRepository) ExistsByFormID(formID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.FormResponse{}).Where("form_id = ?", formID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// HasAnswersForQuestion verifica se existem respostas para uma pergunta específica
func (r *FormResponseRepository) HasAnswersForQuestion(questionID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.FormAnswerDetail{}).Where("question_id = ?", questionID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// HasUserRespondedForm verifica se um usuário já respondeu a um formulário
func (r *FormResponseRepository) HasUserRespondedForm(userID, formID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.FormResponse{}).Where("user_id = ? AND form_id = ?", userID, formID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
