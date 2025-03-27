type alunoService struct {
	alunoRepo repository.AlunoRepository
	// Aqui você pode adicionar outras dependências como serviços de notificação, auditoria, etc.
}

// NewAlunoService cria uma nova instância do serviço de alunos
func NewAlunoService(alunoRepo repository.AlunoRepository) Service {
	return &alunoService{
		alunoRepo: alunoRepo,
	}
}

// GetAlunos retorna uma lista paginada de alunos
func (s *alunoService) GetAlunos(ctx context.Context, page, pageSize int, filtros map[string]interface{}) ([]models.Aluno, int64, error) {
	// Validar parâmetros de paginação
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20 // Valor padrão
	}
	
	// Delegar ao repositório
	return s.alunoRepo.FindAll(ctx, page, pageSize, filtros)
}

// GetAlunoPorID retorna um aluno pelo ID
func (s *alunoService) GetAlunoPorID(ctx context.Context, id uint) (*models.Aluno, error) {
	if id == 0 {
		return nil, fmt.Errorf("ID inválido")
	}
	
	aluno, err := s.alunoRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar aluno: %w", err)
	}
	
	if aluno == nil {
		return nil, fmt.Errorf("aluno não encontrado")
	}
	
	return aluno, nil
}

// GetAlunoPorEmail retorna um aluno pelo e-mail
func (s *alunoService) GetAlunoPorEmail(ctx context.Context, email string) (*models.Aluno, error) {
	if email == "" {
		return nil, fmt.Errorf("e-mail não fornecido")
	}
	
	aluno, err := s.alunoRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar aluno por e-mail: %w", err)
	}
	
	return aluno, nil // Pode retornar nil se não encontrar
}

// GetAlunoPorCPF retorna um aluno pelo CPF
func (s *alunoService) GetAlunoPorCPF(ctx context.Context, cpf string) (*models.Aluno, error) {
	if cpf == "" {
		return nil, fmt.Errorf("CPF não fornecido")
	}
	
	// Remover formatação do CPF
	cpfLimpo := strings.ReplaceAll(strings.ReplaceAll(cpf, ".", ""), "-", "")
	
	// Validar CPF (implementação básica)
	if len(cpfLimpo) != 11 {
		return nil, fmt.Errorf("CPF inválido")
	}
	
	aluno, err := s.alunoRepo.FindByCPF(ctx, cpfLimpo)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar aluno por CPF: %w", err)
	}
	
	return aluno, nil // Pode retornar nil se não encontrar
}

// CriarAluno cria um novo aluno
func (s *alunoService) CriarAluno(ctx context.Context, aluno *models.Aluno) error {
	// Validar campos obrigatórios
	if aluno.Nome == "" {
		return fmt.Errorf("nome é obrigatório")
	}
	if aluno.Email == "" {
		return fmt.Errorf("e-mail é obrigatório")
	}
	if aluno.TelefonePrincipal == "" {
		return fmt.Errorf("telefone principal é obrigatório")
	}
	
	// Validar data de nascimento
	if aluno.DataNascimento.IsZero() {
		return fmt.Errorf("data de nascimento é obrigatória")
	}
	
	// Verificar se já existe aluno com o mesmo e-mail
	existente, err := s.alunoRepo.FindByEmail(ctx, aluno.Email)
	if err != nil {
		return fmt.Errorf("erro ao verificar e-mail existente: %w", err)
	}
	if existente != nil {
		return fmt.Errorf("já existe um aluno com este e-mail")
	}
	
	// Verificar CPF se fornecido
	if aluno.CPF != "" {
		// Limpar CPF
		aluno.CPF = strings.ReplaceAll(strings.ReplaceAll(aluno.CPF, ".", ""), "-", "")
		
		// Verificar se já existe aluno com o mesmo CPF
		existenteCPF, err := s.alunoRepo.FindByCPF(ctx, aluno.CPF)
		if err != nil {
			return fmt.Errorf("erro ao verificar CPF existente: %w", err)
		}
		if existenteCPF != nil {
			return fmt.Errorf("já existe um aluno com este CPF")
		}
	}
	
	// Definir status padrão se não fornecido
	if aluno.Status == "" {
		aluno.Status = "ativo"
	}
	
	// Gerar número de matrícula único (exemplo simples)
	if aluno.NumeroMatricula == "" {
		ano := time.Now().Year()
		timestamp := time.Now().Unix()
		aluno.NumeroMatricula = fmt.Sprintf("%d%d", ano, timestamp)
	}
	
	// Delegar ao repositório
	return s.alunoRepo.Create(ctx, aluno)
}

// AtualizarAluno atualiza um aluno existente
func (s *alunoService) AtualizarAluno(ctx context.Context, aluno *models.Aluno) error {
	if aluno.ID == 0 {
		return fmt.Errorf("ID do aluno não informado")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, aluno.ID)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}
	
	// Verificar e-mail se estiver sendo alterado
	if aluno.Email != "" && aluno.Email != existente.Email {
		emailExistente, err := s.alunoRepo.FindByEmail(ctx, aluno.Email)
		if err != nil {
			return fmt.Errorf("erro ao verificar e-mail existente: %w", err)
		}
		if emailExistente != nil && emailExistente.ID != aluno.ID {
			return fmt.Errorf("já existe outro aluno com este e-mail")
		}
	}
	
	// Verificar CPF se estiver sendo alterado
	if aluno.CPF != "" && aluno.CPF != existente.CPF {
		// Limpar CPF
		aluno.CPF = strings.ReplaceAll(strings.ReplaceAll(aluno.CPF, ".", ""), "-", "")
		
		cpfExistente, err := s.alunoRepo.FindByCPF(ctx, aluno.CPF)
		if err != nil {
			return fmt.Errorf("erro ao verificar CPF existente: %w", err)
		}
		if cpfExistente != nil && cpfExistente.ID != aluno.ID {
			return fmt.Errorf("já existe outro aluno com este CPF")
		}
	}
	
	// Manter o número de matrícula original
	aluno.NumeroMatricula = existente.NumeroMatricula
	
	// Delegar ao repositório
	return s.alunoRepo.Update(ctx, aluno)
}

// ExcluirAluno exclui um aluno
func (s *alunoService) ExcluirAluno(ctx context.Context, id uint) error {
	if id == 0 {
		return fmt.Errorf("ID inválido")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.Delete(ctx, id)
}

// GetResponsaveis retorna os responsáveis de um aluno
func (s *alunoService) GetResponsaveis(ctx context.Context, alunoID uint) ([]models.Responsavel, error) {
	if alunoID == 0 {
		return nil, fmt.Errorf("ID do aluno inválido")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, alunoID)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return nil, fmt.Errorf("aluno não encontrado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.GetResponsaveis(ctx, alunoID)
}

// AdicionarResponsavel adiciona um responsável ao aluno
func (s *alunoService) AdicionarResponsavel(ctx context.Context, responsavel *models.Responsavel) error {
	if responsavel.AlunoID == 0 {
		return fmt.Errorf("ID do aluno não informado")
	}
	
	if responsavel.Nome == "" {
		return fmt.Errorf("nome do responsável é obrigatório")
	}
	
	if responsavel.GrauParentesco == "" {
		return fmt.Errorf("grau de parentesco é obrigatório")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, responsavel.AlunoID)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}
	
	// Verificar limite de responsáveis (máximo 3)
	responsaveis, err := s.alunoRepo.GetResponsaveis(ctx, responsavel.AlunoID)
	if err != nil {
		return fmt.Errorf("erro ao verificar responsáveis existentes: %w", err)
	}
	
	if len(responsaveis) >= 3 {
		return fmt.Errorf("limite de 3 responsáveis por aluno atingido")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.AddResponsavel(ctx, responsavel)
}

// AtualizarResponsavel atualiza um responsável
func (s *alunoService) AtualizarResponsavel(ctx context.Context, responsavel *models.Responsavel) error {
	if responsavel.ID == 0 {
		return fmt.Errorf("ID do responsável não informado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.UpdateResponsavel(ctx, responsavel)
}

// RemoverResponsavel remove um responsável
func (s *alunoService) RemoverResponsavel(ctx context.Context, responsavelID uint) error {
	if responsavelID == 0 {
		return fmt.Errorf("ID do responsável inválido")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.RemoveResponsavel(ctx, responsavelID)
}

// GetDocumentos retorna os documentos de um aluno
func (s *alunoService) GetDocumentos(ctx context.Context, alunoID uint) ([]models.Documento, error) {
	if alunoID == 0 {
		return nil, fmt.Errorf("ID do aluno inválido")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, alunoID)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return nil, fmt.Errorf("aluno não encontrado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.GetDocumentos(ctx, alunoID)
}

// AdicionarDocumento adiciona um documento ao aluno
func (s *alunoService) AdicionarDocumento(ctx context.Context, documento *models.Documento) error {
	if documento.AlunoID == 0 {
		return fmt.Errorf("ID do aluno não informado")
	}
	
	if documento.Nome == "" {
		return fmt.Errorf("nome do documento é obrigatório")
	}
	
	if documento.Tipo == "" {
		return fmt.Errorf("tipo do documento é obrigatório")
	}
	
	if documento.Caminho == "" {
		return fmt.Errorf("caminho do documento é obrigatório")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, documento.AlunoID)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.AddDocumento(ctx, documento)
}

// RemoverDocumento remove um documento
func (s *alunoService) RemoverDocumento(ctx context.Context, documentoID uint) error {
	if documentoID == 0 {
		return fmt.Errorf("ID do documento inválido")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.RemoveDocumento(ctx, documentoID)
}

// AdicionarNota adiciona uma nota ao aluno
func (s *alunoService) AdicionarNota(ctx context.Context, nota *models.NotaAluno) error {
	if nota.AlunoID == 0 {
		return fmt.Errorf("ID do aluno não informado")
	}
	
	if nota.AutorID == 0 {
		return fmt.Errorf("ID do autor não informado")
	}
	
	if nota.Conteudo == "" {
		return fmt.Errorf("conteúdo da nota é obrigatório")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, nota.AlunoID)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return fmt.Errorf("aluno não encontrado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.AddNota(ctx, nota)
}

// GetNotas retorna as notas de um aluno
func (s *alunoService) GetNotas(ctx context.Context, alunoID uint, incluirConfidenciais bool) ([]models.NotaAluno, error) {
	if alunoID == 0 {
		return nil, fmt.Errorf("ID do aluno inválido")
	}
	
	// Verificar se o aluno existe
	existente, err := s.alunoRepo.FindByID(ctx, alunoID)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar existência do aluno: %w", err)
	}
	if existente == nil {
		return nil, fmt.Errorf("aluno não encontrado")
	}
	
	// Delegar ao repositório
	return s.alunoRepo.GetNotas(ctx, alunoID, incluirConfidenciais)
}package alunos

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

// Service define o serviço de alunos
type Service interface {
	// GetAlunos retorna uma lista paginada de alunos
	GetAlunos(ctx context.Context, page, pageSize int, filtros map[string]interface{}) ([]models.Aluno, int64, error)
	
	// GetAlunoPorID retorna um aluno pelo ID
	GetAlunoPorID(ctx context.Context, id uint) (*models.Aluno, error)
	
	// GetAlunoPorEmail retorna um aluno pelo e-mail
	GetAlunoPorEmail(ctx context.Context, email string) (*models.Aluno, error)
	
	// GetAlunoPorCPF retorna um aluno pelo CPF
	GetAlunoPorCPF(ctx context.Context, cpf string) (*models.Aluno, error)
	
	// CriarAluno cria um novo aluno
	CriarAluno(ctx context.Context, aluno *models.Aluno) error
	
	// AtualizarAluno atualiza um aluno existente
	AtualizarAluno(ctx context.Context, aluno *models.Aluno) error
	
	// ExcluirAluno exclui um aluno
	ExcluirAluno(ctx context.Context, id uint) error
	
	// GetResponsaveis retorna os responsáveis de um aluno
	GetResponsaveis(ctx context.Context, alunoID uint) ([]models.Responsavel, error)
	
	// AdicionarResponsavel adiciona um responsável ao aluno
	AdicionarResponsavel(ctx context.Context, responsavel *models.Responsavel) error
	
	// AtualizarResponsavel atualiza um responsável
	AtualizarResponsavel(ctx context.Context, responsavel *models.Responsavel) error
	
	// RemoverResponsavel remove um responsável
	RemoverResponsavel(ctx context.Context, responsavelID uint) error
	
	// GetDocumentos retorna os documentos de um aluno
	GetDocumentos(ctx context.Context, alunoID uint) ([]models.Documento, error)
	
	// AdicionarDocumento adiciona um documento ao aluno
	AdicionarDocumento(ctx context.Context, documento *models.Documento) error
	
	// RemoverDocumento remove um documento
	RemoverDocumento(ctx context.Context, documentoID uint) error
	
	// AdicionarNota adiciona uma nota ao aluno
	AdicionarNota(ctx context.Context, nota *models.NotaAluno) error
	
	// GetNotas retorna as notas de um aluno
	GetNotas(ctx context.Context, alunoID uint, incluirConfidenciais bool) ([]models.NotaAluno, error)
}

// alunoService implementa a interface Service
type alunoService struct {
	alunoRepo repository.AlunoRepository
	// Aqui você pode adicionar outras dependências como serviços de notificação, auditoria, etc.
}

// NewAlunoService cria uma nova instância de alunoService
func NewAlunoService(alunoRepo repository.AlunoRepository) *alunoService {
	return &alunoService{
		alunoRepo: alunoRepo,
	}
}
