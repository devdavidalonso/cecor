package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/database"
	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/gin-gonic/gin"
)

// AlunoHandler manipula as requisições HTTP relacionadas a alunos
type AlunoHandler struct {
	repo *database.AlunoRepository
}

// NewAlunoHandler cria uma nova instância de AlunoHandler
func NewAlunoHandler(repo *database.AlunoRepository) *AlunoHandler {
	return &AlunoHandler{repo}
}

// GetAlunos retorna todos os alunos
func (h *AlunoHandler) GetAlunos(c *gin.Context) {
	alunos, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, alunos)
}

// GetAluno retorna um aluno pelo ID
func (h *AlunoHandler) GetAluno(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	aluno, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Aluno não encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, aluno)
}

// CreateAluno cria um novo aluno
func (h *AlunoHandler) CreateAluno(c *gin.Context) {
	var aluno models.Aluno
	if err := c.ShouldBindJSON(&aluno); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	aluno.DataCriacao = time.Now()
	aluno.Ativo = true

	createdAluno, err := h.repo.Create(aluno)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, createdAluno)
}

// UpdateAluno atualiza um aluno
func (h *AlunoHandler) UpdateAluno(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	var aluno models.Aluno
	if err := c.ShouldBindJSON(&aluno); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	aluno.ID = uint(id)
	updatedAluno, err := h.repo.Update(aluno)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedAluno)
}

// DeleteAluno marca um aluno como inativo
func (h *AlunoHandler) DeleteAluno(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Aluno desativado com sucesso",
	})
}

// CursoHandler manipula as requisições HTTP relacionadas a cursos
type CursoHandler struct {
	repo *database.CursoRepository
}

// NewCursoHandler cria uma nova instância de CursoHandler
func NewCursoHandler(repo *database.CursoRepository) *CursoHandler {
	return &CursoHandler{repo}
}

// GetCursos retorna todos os cursos
func (h *CursoHandler) GetCursos(c *gin.Context) {
	cursos, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, cursos)
}

// GetCurso retorna um curso pelo ID
func (h *CursoHandler) GetCurso(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	curso, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Curso não encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, curso)
}

// CreateCurso cria um novo curso
func (h *CursoHandler) CreateCurso(c *gin.Context) {
	var curso models.Curso
	if err := c.ShouldBindJSON(&curso); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	curso.DataCriacao = time.Now()
	curso.Ativo = true

	createdCurso, err := h.repo.Create(curso)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, createdCurso)
}

// UpdateCurso atualiza um curso
func (h *CursoHandler) UpdateCurso(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	var curso models.Curso
	if err := c.ShouldBindJSON(&curso); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	curso.ID = uint(id)
	updatedCurso, err := h.repo.Update(curso)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedCurso)
}

// DeleteCurso marca um curso como inativo
func (h *CursoHandler) DeleteCurso(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Curso desativado com sucesso",
	})
}

// MatriculaHandler manipula as requisições HTTP relacionadas a matrículas
type MatriculaHandler struct {
	repo *database.MatriculaRepository
}

// NewMatriculaHandler cria uma nova instância de MatriculaHandler
func NewMatriculaHandler(repo *database.MatriculaRepository) *MatriculaHandler {
	return &MatriculaHandler{repo}
}

// GetMatriculas retorna todas as matrículas
func (h *MatriculaHandler) GetMatriculas(c *gin.Context) {
	matriculas, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, matriculas)
}

// GetMatricula retorna uma matrícula pelo ID
func (h *MatriculaHandler) GetMatricula(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	matricula, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Matrícula não encontrada",
		})
		return
	}

	c.JSON(http.StatusOK, matricula)
}

// CreateMatricula cria uma nova matrícula
func (h *MatriculaHandler) CreateMatricula(c *gin.Context) {
	var matricula models.Matricula
	if err := c.ShouldBindJSON(&matricula); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	matricula.DataCriacao = time.Now()
	matricula.DataMatricula = time.Now()

	createdMatricula, err := h.repo.Create(matricula)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, createdMatricula)
}

// UpdateMatricula atualiza uma matrícula
func (h *MatriculaHandler) UpdateMatricula(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	var matricula models.Matricula
	if err := c.ShouldBindJSON(&matricula); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	matricula.ID = uint(id)
	updatedMatricula, err := h.repo.Update(matricula)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedMatricula)
}

// DeleteMatricula remove uma matrícula
func (h *MatriculaHandler) DeleteMatricula(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Matrícula removida com sucesso",
	})
}

// ResponsavelHandler manipula as requisições HTTP relacionadas a responsáveis
type ResponsavelHandler struct {
	repo *database.ResponsavelRepository
}

// NewResponsavelHandler cria uma nova instância de ResponsavelHandler
func NewResponsavelHandler(repo *database.ResponsavelRepository) *ResponsavelHandler {
	return &ResponsavelHandler{repo}
}

// GetResponsaveis retorna todos os responsáveis
func (h *ResponsavelHandler) GetResponsaveis(c *gin.Context) {
	responsaveis, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, responsaveis)
}

// GetResponsavel retorna um responsável pelo ID
func (h *ResponsavelHandler) GetResponsavel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	responsavel, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Responsável não encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, responsavel)
}

// CreateResponsavel cria um novo responsável
func (h *ResponsavelHandler) CreateResponsavel(c *gin.Context) {
	var responsavel models.Responsavel
	if err := c.ShouldBindJSON(&responsavel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	responsavel.DataCriacao = time.Now()

	createdResponsavel, err := h.repo.Create(responsavel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, createdResponsavel)
}

// UpdateResponsavel atualiza um responsável
func (h *ResponsavelHandler) UpdateResponsavel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	var responsavel models.Responsavel
	if err := c.ShouldBindJSON(&responsavel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	responsavel.ID = uint(id)
	updatedResponsavel, err := h.repo.Update(responsavel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedResponsavel)
}

// DeleteResponsavel remove um responsável
func (h *ResponsavelHandler) DeleteResponsavel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Responsável removido com sucesso",
	})
}