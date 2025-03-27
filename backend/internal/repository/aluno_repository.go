package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"gorm.io/gorm"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

// alunoRepository implementa a interface AlunoRepository usando PostgreSQL/GORM
type alunoRepository struct {
	db *gorm.DB
}

// NewAlunoRepository cria uma nova implementação de AlunoRepository
func NewAlunoRepository(db *gorm.DB) repository.AlunoRepository {
	return &alunoRepository{
		db: db,
	}
}

// FindAll retorna todos os alunos (com paginação e filtros)
func (r *alunoRepository) FindAll(ctx context.Context, page int, pageSize int, filters map[string]interface{}) ([]models.Aluno, int64, error) {
	var alunos []models.Aluno
	var total int64

	// Iniciar query com soft delete excluído
	query := r.db.WithContext(ctx).Model(&models.Aluno{}).Where("excluido_em IS NULL")

	// Aplicar filtros
	for key, value := range filters {
		switch key {
		case "nome":
			query = query.Where("nome ILIKE ?", fmt.Sprintf("%%%s%%", value))
		case "email":
			query = query.Where("email ILIKE ?", fmt.Sprintf("%%%s%%", value))
		case "cpf":
			query = query.Where("cpf = ?", value)
		case "status":
			query = query.Where("status = ?", value)
		case "idade_min":
			// Implementar filtro por idade mínima usando data de nascimento
			// Este é um exemplo, a lógica exata pode variar
			query = query.Where("data_nascimento <= CURRENT_DATE - INTERVAL '? year'", value)
		case "idade_max":
			// Implementar filtro por idade máxima usando data de nascimento
			query = query.Where("data_nascimento >= CURRENT_DATE - INTERVAL '? year'", value)
		case "curso_id":
			// Filtro por curso requer um join com matrículas
			query = query.Joins("JOIN matriculas ON matriculas.aluno_id = alunos.id").
				Where("matriculas.curso_id = ? AND matriculas.status IN ('ativa', 'em_curso')", value)
		}
	}

	// Contar total de registros (para paginação)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("erro ao contar alunos: %w", err)
	}

	// Aplicar paginação
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Ordenar por nome (default)
	query = query.Order("nome ASC")

	// Executar consulta
	if err := query.Find(&alunos).Error; err != nil {
		return nil, 0, fmt.Errorf("erro ao buscar alunos: %w", err)
	}

	// Calcular idades
	for i := range alunos {
		alunos[i].CalcularIdade()
	}

	return alunos, total, nil
}

// FindByID busca um aluno pelo ID
func (r *alunoRepository) FindByID(ctx context.Context, id uint) (*models.Aluno, error) {
	var aluno models.Aluno

	result := r.db.WithContext(ctx).
		Where("id = ? AND excluido_em IS NULL", id).
		First(&aluno)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Retorna nil sem erro quando não encontra
		}
		return nil, fmt.Errorf("erro ao buscar aluno por ID: %w", result.Error)
	}

	// Calcular idade
	aluno.CalcularIdade()

	return &aluno, nil
}

// FindByEmail busca um aluno pelo e-mail
func (r *alunoRepository) FindByEmail(ctx context.Context, email string) (*models.Aluno, error) {
	var aluno models.Aluno

	result := r.db.WithContext(ctx).
		Where("LOWER(email) = LOWER(?) AND excluido_em IS NULL", email).
		First(&aluno)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Retorna nil sem erro quando não encontra
		}
		return nil, fmt.Errorf("erro ao buscar aluno por e-mail: %w", result.Error)
	}

	// Calcular idade
	aluno.CalcularIdade()

	return &aluno, nil
}

// FindByCPF busca um aluno pelo CPF
func (r *alunoRepository) FindByCPF(ctx context.Context, cpf string) (*models.Aluno, error) {
	var aluno models.Aluno

	// Remover formatação do CPF
	cpfLimpo := strings.ReplaceAll(strings.ReplaceAll(cpf, ".", ""), "-", "")

	result := r.db.WithContext(ctx).
		Where("cpf = ? AND excluido_em IS NULL", cpfLimpo).
		First(&aluno)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Retorna nil sem erro quando não encontra
		}
		return nil, fmt.Errorf("erro ao buscar aluno por CPF: %w", result.Error)
	}

	// Calcular idade
	aluno.CalcularIdade()

	return &aluno, nil
}

// Create cria um novo aluno
func (r *alunoRepository) Create(ctx context.Context, aluno *models.Aluno) error {
	// Verificar campos obrigatórios
	if aluno.Nome == "" || aluno.Email == "" || aluno.TelefonePrincipal == "" {
		return fmt.Errorf("campos obrigatórios não preenchidos")
	}

	// Limpar CPF se fornecido
	if aluno.CPF != "" {
		aluno.CPF = strings.ReplaceAll(strings.ReplaceAll(aluno.CPF, ".", ""), "-", "")
	}

	// Realizar a inserção
	if err := r.db.WithContext(ctx).Create(aluno).Error; err != nil {
		if strings.Contains(err.Error(), "unique constraint") {
			if strings.Contains(err.Error(), "email") {
				return fmt.Errorf("já existe um aluno com este e-mail")
			}
			if strings.Contains(err.Error(), "cpf") {
				return fmt.Errorf("já existe um aluno com este CPF")
			}
			return fmt.Errorf("violação de unicidade: %w", err)
		}
		return fmt.Errorf("erro ao criar aluno: %w", err)
	}

	return nil
}

// Update atualiza um aluno existente
func (r *alunoRepository) Update(ctx context.Context, aluno *models.Aluno) error {
	// Verificar se aluno existe
	existente, err := r.FindByID(ctx, aluno.ID)
	if err != nil {
		return err
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}

	// Limpar CPF se fornecido
	if aluno.CPF != "" {
		aluno.CPF = strings.ReplaceAll(strings.ReplaceAll(aluno.CPF, ".", ""), "-", "")
	}

	// Atualizar apenas os campos não vazios
	result := r.db.WithContext(ctx).Model(aluno).Updates(aluno)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "unique constraint") {
			if strings.Contains(result.Error.Error(), "email") {
				return fmt.Errorf("já existe outro aluno com este e-mail")
			}
			if strings.Contains(result.Error.Error(), "cpf") {
				return fmt.Errorf("já existe outro aluno com este CPF")
			}
			return fmt.Errorf("violação de unicidade: %w", result.Error)
		}
		return fmt.Errorf("erro ao atualizar aluno: %w", result.Error)
	}

	return nil
}

// Delete exclui um aluno (exclusão lógica)
func (r *alunoRepository) Delete(ctx context.Context, id uint) error {
	// Verificar se aluno existe
	existente, err := r.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}

	// Soft delete (atualiza o campo excluido_em)
	result := r.db.WithContext(ctx).Model(&models.Aluno{}).
		Where("id = ?", id).
		Update("excluido_em", gorm.Expr("NOW()"))

	if result.Error != nil {
		return fmt.Errorf("erro ao excluir aluno: %w", result.Error)
	}

	return nil
}

// GetResponsaveis retorna os responsáveis de um aluno
func (r *alunoRepository) GetResponsaveis(ctx context.Context, alunoID uint) ([]models.Responsavel, error) {
	var responsaveis []models.Responsavel

	result := r.db.WithContext(ctx).
		Where("aluno_id = ? AND excluido_em IS NULL", alunoID).
		Find(&responsaveis)

	if result.Error != nil {
		return nil, fmt.Errorf("erro ao buscar responsáveis: %w", result.Error)
	}

	return responsaveis, nil
}

// AddResponsavel adiciona um responsável ao aluno
func (r *alunoRepository) AddResponsavel(ctx context.Context, responsavel *models.Responsavel) error {
	// Verificar campos obrigatórios
	if responsavel.Nome == "" || responsavel.GrauParentesco == "" {
		return fmt.Errorf("campos obrigatórios não preenchidos")
	}

	// Verificar se aluno existe
	aluno, err := r.FindByID(ctx, responsavel.AlunoID)
	if err != nil {
		return err
	}
	if aluno == nil {
		return fmt.Errorf("aluno não encontrado")
	}

	// Limpar CPF se fornecido
	if responsavel.CPF != "" {
		responsavel.CPF = strings.ReplaceAll(strings.ReplaceAll(responsavel.CPF, ".", ""), "-", "")
	}

	// Inserir responsável
	if err := r.db.WithContext(ctx).Create(responsavel).Error; err != nil {
		return fmt.Errorf("erro ao adicionar responsável: %w", err)
	}

	return nil
}

// UpdateResponsavel atualiza um responsável existente
func (r *alunoRepository) UpdateResponsavel(ctx context.Context, responsavel *models.Responsavel) error {
	// Verificar se responsável existe
	var existente models.Responsavel
	result := r.db.WithContext(ctx).
		Where("id = ? AND excluido_em IS NULL", responsavel.ID).
		First(&existente)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return fmt.Errorf("responsável não encontrado")
		}
		return fmt.Errorf("erro ao buscar responsável: %w", result.Error)
	}

	// Limpar CPF se fornecido
	if responsavel.CPF != "" {
		responsavel.CPF = strings.ReplaceAll(strings.ReplaceAll(responsavel.CPF, ".", ""), "-", "")
	}

	// Atualizar responsável
	if err := r.db.WithContext(ctx).Model(responsavel).Updates(responsavel).Error; err != nil {
		return fmt.Errorf("erro ao atualizar responsável: %w", err)
	}

	return nil
}

// RemoveResponsavel remove um responsável do aluno
func (r *alunoRepository) RemoveResponsavel(ctx context.Context, responsavelID uint) error {
	// Verificar se responsável existe
	var existente models.Responsavel
	result := r.db.WithContext(ctx).
		Where("id = ? AND excluido_em IS NULL", responsavelID).
		First(&existente)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return fmt.Errorf("responsável não encontrado")
		}
		return fmt.Errorf("erro ao buscar responsável: %w", result.Error)
	}

	// Soft delete
	if err := r.db.WithContext(ctx).Model(&models.Responsavel{}).
		Where("id = ?", responsavelID).
		Update("excluido_em", gorm.Expr("NOW()")).Error; err != nil {
		return fmt.Errorf("erro ao remover responsável: %w", err)
	}

	return nil
}

// GetDocumentos retorna os documentos de um aluno
func (r *alunoRepository) GetDocumentos(ctx context.Context, alunoID uint) ([]models.Documento, error) {
	var documentos []models.Documento

	result := r.db.WithContext(ctx).
		Where("aluno_id = ?", alunoID).
		Find(&documentos)

	if result.Error != nil {
		return nil, fmt.Errorf("erro ao buscar documentos: %w", result.Error)
	}

	return documentos, nil
}

// AddDocumento adiciona um documento ao aluno
func (r *alunoRepository) AddDocumento(ctx context.Context, documento *models.Documento) error {
	// Verificar campos obrigatórios
	if documento.Nome == "" || documento.Tipo == "" || documento.Caminho == "" {
		return fmt.Errorf("campos obrigatórios não preenchidos")
	}

	// Verificar se aluno existe
	aluno, err := r.FindByID(ctx, documento.AlunoID)
	if err != nil {
		return err
	}
	if aluno == nil {
		return fmt.Errorf("aluno não encontrado")
	}

	// Inserir documento
	if err := r.db.WithContext(ctx).Create(documento).Error; err != nil {
		return fmt.Errorf("erro ao adicionar documento: %w", err)
	}

	return nil
}

// RemoveDocumento remove um documento do aluno
func (r *alunoRepository) RemoveDocumento(ctx context.Context, documentoID uint) error {
	// Verificar se documento existe
	var existente models.Documento
	result := r.db.WithContext(ctx).
		Where("id = ?", documentoID).
		First(&existente)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return fmt.Errorf("documento não encontrado")
		}
		return fmt.Errorf("erro ao buscar documento: %w", result.Error)
	}

	// Excluir documento (hard delete)
	if err := r.db.WithContext(ctx).Delete(&existente).Error; err != nil {
		return fmt.Errorf("erro ao remover documento: %w", err)
	}

	return nil
}

// AddNota adiciona uma nota/observação ao aluno
func (r *alunoRepository) AddNota(ctx context.Context, nota *models.NotaAluno) error {
	// Verificar campos obrigatórios
	if nota.Conteudo == "" {
		return fmt.Errorf("campo conteúdo é obrigatório")
	}

	// Verificar se aluno existe
	aluno, err := r.FindByID(ctx, nota.AlunoID)
	if err != nil {
		return err
	}
	if aluno == nil {
		return fmt.Errorf("aluno não encontrado")
	}

	// Inserir nota
	if err := r.db.WithContext(ctx).Create(nota).Error; err != nil {
		return fmt.Errorf("erro ao adicionar nota: %w", err)
	}

	return nil
}

// GetNotas retorna as notas/observações de um aluno
func (r *alunoRepository) GetNotas(ctx context.Context, alunoID uint, incluirConfidenciais bool) ([]models.NotaAluno, error) {
	var notas []models.NotaAluno

	query := r.db.WithContext(ctx).Where("aluno_id = ?", alunoID)

	// Filtrar confidenciais se necessário
	if !incluirConfidenciais {
		query = query.Where("confidencial = false")
	}

	// Ordenar por data de criação (mais recentes primeiro)
	query = query.Order("criado_em DESC")

	if err := query.Find(&notas).Error; err != nil {
		return nil, fmt.Errorf("erro ao buscar notas: %w", err)
	}

	return notas, nil
}
