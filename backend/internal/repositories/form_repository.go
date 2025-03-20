// internal/repositories/form_repository.go
package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// FormRepository implementa operações de banco de dados para formulários
type FormRepository struct {
	db *gorm.DB
}

// NewFormRepository cria uma nova instância de FormRepository
func NewFormRepository(db *gorm.DB) *FormRepository {
	return &FormRepository{db}
}

// GetDB retorna a instância do banco de dados
func (r *FormRepository) GetDB() *gorm.DB {
	return r.db
}

// FindAll retorna todos os formulários ativos
func (r *FormRepository) FindAll() ([]models.Form, error) {
	var forms []models.Form
	if err := r.db.Where("deleted_at IS NULL").Find(&forms).Error; err != nil {
		return nil, err
	}
	return forms, nil
}

// FindByID retorna um formulário pelo ID com suas perguntas
func (r *FormRepository) FindByID(id uint) (models.Form, error) {
	var form models.Form
	if err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&form).Error; err != nil {
		return form, err
	}

	// Carregar perguntas associadas
	if err := r.db.Where("form_id = ?", id).Order("display_order ASC").Find(&form.Questions).Error; err != nil {
		return form, err
	}

	return form, nil
}

// Create cria um novo formulário
func (r *FormRepository) Create(form *models.Form) error {
	return r.db.Create(form).Error
}

// Update atualiza um formulário existente
func (r *FormRepository) Update(form *models.Form) error {
	return r.db.Save(form).Error
}

// Delete realiza uma exclusão lógica de um formulário
func (r *FormRepository) Delete(id uint) error {
	return r.db.Model(&models.Form{}).Where("id = ?", id).Update("deleted_at", gorm.Expr("NOW()")).Error
}

// FindWithFilters busca formulários com paginação e filtros
func (r *FormRepository) FindWithFilters(offset, limit int, filters map[string]interface{}) ([]models.Form, int, error) {
	var forms []models.Form
	var count int64

	query := r.db.Model(&models.Form{}).Where("deleted_at IS NULL")

	// Aplicar filtros
	if title, ok := filters["title"].(string); ok && title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}

	if formType, ok := filters["type"].(string); ok && formType != "" {
		query = query.Where("type = ?", formType)
	}

	if audience, ok := filters["target_audience"].(string); ok && audience != "" {
		query = query.Where("target_audience = ?", audience)
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}

	// Contar total antes de aplicar paginação
	query.Count(&count)

	// Aplicar paginação e buscar resultados
	if err := query.Offset(offset).Limit(limit).Find(&forms).Error; err != nil {
		return nil, 0, err
	}

	return forms, int(count), nil
}

// DeactivateAllTemplates desativa todos os modelos de formulários
func (r *FormRepository) DeactivateAllTemplates() error {
	return r.db.Model(&models.Form{}).Where("status = ?", "active").Update("status", "inactive").Error
}

// CreateQuestion cria uma nova pergunta para um formulário
func (r *FormRepository) CreateQuestion(question *models.FormQuestion) error {
	return r.db.Create(question).Error
}

// UpdateQuestion atualiza uma pergunta existente
func (r *FormRepository) UpdateQuestion(question *models.FormQuestion) error {
	return r.db.Save(question).Error
}

// DeleteQuestion exclui uma pergunta de formulário
func (r *FormRepository) DeleteQuestion(id uint) error {
	return r.db.Delete(&models.FormQuestion{}, id).Error
}

// GetActiveFormTemplate retorna o modelo de formulário ativo
func (r *FormRepository) GetActiveFormTemplate() (models.Form, error) {
	var form models.Form
	if err := r.db.Where("status = ? AND deleted_at IS NULL", "active").First(&form).Error; err != nil {
		return form, err
	}
	return form, nil
}

// ListInterviews lista todas as entrevistas
func (r *FormRepository) ListInterviews() ([]models.Interview, error) {
	var interviews []models.Interview
	if err := r.db.Find(&interviews).Error; err != nil {
		return nil, err
	}
	return interviews, nil
}

// GetInterview retorna uma entrevista pelo ID
func (r *FormRepository) GetInterview(id uint) (models.Interview, error) {
	var interview models.Interview
	if err := r.db.First(&interview, id).Error; err != nil {
		return interview, err
	}
	return interview, nil
}

// CreateInterview cria uma nova entrevista
func (r *FormRepository) CreateInterview(interview *models.Interview) error {
	return r.db.Create(interview).Error
}

// UpdateInterview atualiza uma entrevista existente
func (r *FormRepository) UpdateInterview(interview *models.Interview) error {
	return r.db.Save(interview).Error
}
