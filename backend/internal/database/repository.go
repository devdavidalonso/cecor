package database

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/jinzhu/gorm"
)

// AlunoRepository implementa as operações de banco de dados para Alunos
type AlunoRepository struct {
	db *gorm.DB
}

// NewAlunoRepository cria uma nova instância de AlunoRepository
func NewAlunoRepository(db *gorm.DB) *AlunoRepository {
	return &AlunoRepository{db}
}

// FindAll retorna todos os alunos ativos
func (r *AlunoRepository) FindAll() ([]models.Aluno, error) {
	var alunos []models.Aluno
	if err := r.db.Where("ativo = ?", true).Find(&alunos).Error; err != nil {
		return nil, err
	}
	return alunos, nil
}

// FindByID retorna um aluno pelo ID
func (r *AlunoRepository) FindByID(id uint) (models.Aluno, error) {
	var aluno models.Aluno
	if err := r.db.Where("id = ? AND ativo = ?", id, true).First(&aluno).Error; err != nil {
		return aluno, err
	}
	return aluno, nil
}

// Create cria um novo aluno
func (r *AlunoRepository) Create(aluno models.Aluno) (models.Aluno, error) {
	if err := r.db.Create(&aluno).Error; err != nil {
		return aluno, err
	}
	return aluno, nil
}

// Update atualiza um aluno
func (r *AlunoRepository) Update(aluno models.Aluno) (models.Aluno, error) {
	if err := r.db.Save(&aluno).Error; err != nil {
		return aluno, err
	}
	return aluno, nil
}

// Delete marca um aluno como inativo (soft delete)
func (r *AlunoRepository) Delete(id uint) error {
	return r.db.Model(&models.Aluno{}).Where("id = ?", id).Update("ativo", false).Error
}

// FindWithResponsaveis retorna um aluno com seus responsáveis
func (r *AlunoRepository) FindWithResponsaveis(id uint) (models.Aluno, error) {
	var aluno models.Aluno
	if err := r.db.Where("id = ? AND ativo = ?", id, true).Preload("Responsaveis").First(&aluno).Error; err != nil {
		return aluno, err
	}
	return aluno, nil
}

// CursoRepository implementa as operações de banco de dados para Cursos
type CursoRepository struct {
	db *gorm.DB
}

// NewCursoRepository cria uma nova instância de CursoRepository
func NewCursoRepository(db *gorm.DB) *CursoRepository {
	return &CursoRepository{db}
}

// FindAll retorna todos os cursos ativos
func (r *CursoRepository) FindAll() ([]models.Curso, error) {
	var cursos []models.Curso
	if err := r.db.Where("ativo = ?", true).Find(&cursos).Error; err != nil {
		return nil, err
	}
	return cursos, nil
}

// FindByID retorna um curso pelo ID
func (r *CursoRepository) FindByID(id uint) (models.Curso, error) {
	var curso models.Curso
	if err := r.db.Where("id = ? AND ativo = ?", id, true).First(&curso).Error; err != nil {
		return curso, err
	}
	return curso, nil
}

// Create cria um novo curso
func (r *CursoRepository) Create(curso models.Curso) (models.Curso, error) {
	if err := r.db.Create(&curso).Error; err != nil {
		return curso, err
	}
	return curso, nil
}

// Update atualiza um curso
func (r *CursoRepository) Update(curso models.Curso) (models.Curso, error) {
	if err := r.db.Save(&curso).Error; err != nil {
		return curso, err
	}
	return curso, nil
}

// Delete marca um curso como inativo (soft delete)
func (r *CursoRepository) Delete(id uint) error {
	return r.db.Model(&models.Curso{}).Where("id = ?", id).Update("ativo", false).Error
}

// MatriculaRepository implementa as operações de banco de dados para Matrículas
type MatriculaRepository struct {
	db *gorm.DB
}

// NewMatriculaRepository cria uma nova instância de MatriculaRepository
func NewMatriculaRepository(db *gorm.DB) *MatriculaRepository {
	return &MatriculaRepository{db}
}

// FindAll retorna todas as matrículas
func (r *MatriculaRepository) FindAll() ([]models.Matricula, error) {
	var matriculas []models.Matricula
	if err := r.db.Find(&matriculas).Error; err != nil {
		return nil, err
	}
	return matriculas, nil
}

// FindByID retorna uma matrícula pelo ID
func (r *MatriculaRepository) FindByID(id uint) (models.Matricula, error) {
	var matricula models.Matricula
	if err := r.db.First(&matricula, id).Error; err != nil {
		return matricula, err
	}
	return matricula, nil
}

// Create cria uma nova matrícula
func (r *MatriculaRepository) Create(matricula models.Matricula) (models.Matricula, error) {
	if err := r.db.Create(&matricula).Error; err != nil {
		return matricula, err
	}
	return matricula, nil
}

// Update atualiza uma matrícula
func (r *MatriculaRepository) Update(matricula models.Matricula) (models.Matricula, error) {
	if err := r.db.Save(&matricula).Error; err != nil {
		return matricula, err
	}
	return matricula, nil
}

// Delete remove uma matrícula
func (r *MatriculaRepository) Delete(id uint) error {
	return r.db.Delete(&models.Matricula{}, id).Error
}

// FindByCurso retorna todas as matrículas de um curso
func (r *MatriculaRepository) FindByCurso(cursoID uint) ([]models.Matricula, error) {
	var matriculas []models.Matricula
	if err := r.db.Where("curso_id = ?", cursoID).Preload("Aluno").Find(&matriculas).Error; err != nil {
		return nil, err
	}
	return matriculas, nil
}

// FindByAluno retorna todas as matrículas de um aluno
func (r *MatriculaRepository) FindByAluno(alunoID uint) ([]models.Matricula, error) {
	var matriculas []models.Matricula
	if err := r.db.Where("aluno_id = ?", alunoID).Preload("Curso").Find(&matriculas).Error; err != nil {
		return nil, err
	}
	return matriculas, nil
}

// ResponsavelRepository implementa as operações de banco de dados para Responsáveis
type ResponsavelRepository struct {
	db *gorm.DB
}

// NewResponsavelRepository cria uma nova instância de ResponsavelRepository
func NewResponsavelRepository(db *gorm.DB) *ResponsavelRepository {
	return &ResponsavelRepository{db}
}

// FindAll retorna todos os responsáveis
func (r *ResponsavelRepository) FindAll() ([]models.Responsavel, error) {
	var responsaveis []models.Responsavel
	if err := r.db.Find(&responsaveis).Error; err != nil {
		return nil, err
	}
	return responsaveis, nil
}

// FindByID retorna um responsável pelo ID
func (r *ResponsavelRepository) FindByID(id uint) (models.Responsavel, error) {
	var responsavel models.Responsavel
	if err := r.db.First(&responsavel, id).Error; err != nil {
		return responsavel, err
	}
	return responsavel, nil
}

// Create cria um novo responsável
func (r *ResponsavelRepository) Create(responsavel models.Responsavel) (models.Responsavel, error) {
	if err := r.db.Create(&responsavel).Error; err != nil {
		return responsavel, err
	}
	return responsavel, nil
}

// Update atualiza um responsável
func (r *ResponsavelRepository) Update(responsavel models.Responsavel) (models.Responsavel, error) {
	if err := r.db.Save(&responsavel).Error; err != nil {
		return responsavel, err
	}
	return responsavel, nil
}

// Delete remove um responsável
func (r *ResponsavelRepository) Delete(id uint) error {
	return r.db.Delete(&models.Responsavel{}, id).Error
}

// FindByAluno retorna todos os responsáveis de um aluno
func (r *ResponsavelRepository) FindByAluno(alunoID uint) ([]models.Responsavel, error) {
	var responsaveis []models.Responsavel
	if err := r.db.Where("aluno_id = ?", alunoID).Find(&responsaveis).Error; err != nil {
		return nil, err
	}
	return responsaveis, nil
}