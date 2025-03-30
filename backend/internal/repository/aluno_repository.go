package repository

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// AlunoRepository define a interface para acesso aos dados de alunos
type AlunoRepository interface {
	FindAll(ctx context.Context, page int, pageSize int, filters map[string]interface{}) ([]models.Aluno, int64, error)
	FindByID(ctx context.Context, id uint) (*models.Aluno, error)
	FindByEmail(ctx context.Context, email string) (*models.Aluno, error)
	FindByCPF(ctx context.Context, cpf string) (*models.Aluno, error)
	Create(ctx context.Context, aluno *models.Aluno) error
	Update(ctx context.Context, aluno *models.Aluno) error
	Delete(ctx context.Context, id uint) error
	GetResponsaveis(ctx context.Context, alunoID uint) ([]models.Responsavel, error)
	AddResponsavel(ctx context.Context, responsavel *models.Responsavel) error
	UpdateResponsavel(ctx context.Context, responsavel *models.Responsavel) error
	RemoveResponsavel(ctx context.Context, responsavelID uint) error
	GetDocumentos(ctx context.Context, alunoID uint) ([]models.Documento, error)
	AddDocumento(ctx context.Context, documento *models.Documento) error
	RemoveDocumento(ctx context.Context, documentoID uint) error
	AddNota(ctx context.Context, nota *models.NotaAluno) error
	GetNotas(ctx context.Context, alunoID uint, incluirConfidenciais bool) ([]models.NotaAluno, error)
}
