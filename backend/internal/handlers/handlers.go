package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/database"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// Handler gerencia os manipuladores de requisições HTTP
type Handler struct {
	repo *database.Repository
}

// NewHandler cria um novo Handler
func NewHandler(repo *database.Repository) *Handler {
	return &Handler{
		repo: repo,
	}
}

// GetAlunos retorna todos os alunos
func (h *Handler) GetAlunos(c *gin.Context) {
	alunos, err := h.repo.GetAlunos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar alunos"})
		return
	}

	c.JSON(http.StatusOK, alunos)
}

// GetAluno retorna um aluno pelo ID
func (h *Handler) GetAluno(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	aluno, err := h.repo.GetAluno(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Aluno não encontrado"})
		return
	}

	c.JSON(http.StatusOK, aluno)
}

// CreateAluno cria um novo aluno
func (h *Handler) CreateAluno(c *gin.Context) {
	var aluno models.Aluno
	if err := c.ShouldBindJSON(&aluno); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.repo.CreateAluno(aluno)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar aluno"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id": id,
		"message": "Aluno criado com sucesso",
	})
}

// GetCursos retorna todos os cursos
func (h *Handler) GetCursos(c *gin.Context) {
	cursos, err := h.repo.GetCursos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
		return
	}

	c.JSON(http.StatusOK, cursos)
}

// GetCurso retorna um curso pelo ID
func (h *Handler) GetCurso(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	curso, err := h.repo.GetCurso(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
		return
	}

	c.JSON(http.StatusOK, curso)
}

// CreateMatricula cria uma nova matrícula
func (h *Handler) CreateMatricula(c *gin.Context) {
	var matricula models.Matricula
	if err := c.ShouldBindJSON(&matricula); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Se não especificado, usar data atual
	if matricula.DataMatricula == "" {
		matricula.DataMatricula = time.Now().Format("2006-01-02")
	}
	
	// Se não especificado, usar status padrão
	if matricula.Status == "" {
		matricula.Status = "em_curso"
	}

	id, numeroMatricula, err := h.repo.CreateMatricula(matricula)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar matrícula"})
		return
	}

	// Buscar dados adicionais para a resposta
	aluno, _ := h.repo.GetAluno(matricula.AlunoID)
	curso, _ := h.repo.GetCurso(matricula.CursoID)

	c.JSON(http.StatusCreated, gin.H{
		"id": id,
		"numero_matricula": numeroMatricula,
		"message": "Matrícula realizada com sucesso",
		"aluno": aluno.Nome,
		"curso": curso.Nome,
	})
}

// GetMatriculas retorna todas as matrículas
func (h *Handler) GetMatriculas(c *gin.Context) {
	// Implementação simplificada - em um sistema real precisaríamos de paginação
	c.JSON(http.StatusOK, gin.H{"message": "Endpoint não implementado"})
}

// GetMatriculasByCurso retorna matrículas de um curso específico
func (h *Handler) GetMatriculasByCurso(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
		return
	}

	matriculas, err := h.repo.GetMatriculasByCurso(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar matrículas"})
		return
	}

	c.JSON(http.StatusOK, matriculas)
}

// UpdatePresencas atualiza ou cria registros de presença
func (h *Handler) UpdatePresencas(c *gin.Context) {
	var req models.PresencaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.repo.SavePresenca(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar presença"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Presença registrada com sucesso",
	})
}

// GetPresencasByCursoMes retorna presença para um curso em um mês específico
func (h *Handler) GetPresencasByCursoMes(c *gin.Context) {
	cursoID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
		return
	}

	// Formato esperado: AAAA-MM ou "atual"
	mesParam := c.Param("mes")
	var mes, ano int
	
	if mesParam == "atual" {
		now := time.Now()
		mes = int(now.Month())
		ano = now.Year()
	} else {
		t, err := time.Parse("2006-01", mesParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de mês inválido"})
			return
		}
		mes = int(t.Month())
		ano = t.Year()
	}

	// Buscar matrícula para o curso
	matriculas, err := h.repo.GetMatriculasByCurso(cursoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar matrículas"})
		return
	}

	// Gerar todos os dias do mês
	diasDoMes := getDiasMes(mes, ano)
	
	// Buscar presenças para cada matrícula
	for i := range matriculas {
		presencas, err := h.repo.GetPresencasByMatriculaAndPeriodo(matriculas[i].ID, mes, ano)
		if err != nil {
			continue
		}
		
		// Adicionar as presenças ao objeto (não mostrado aqui, seria necessário uma estrutura adicional)
		_ = presencas // Placeholder
	}

	// Montar resposta completa
	resposta := models.PeriodoPresenca{
		CursoID:    cursoID,
		Mes:        mes,
		Ano:        ano,
		DiasDoMes:  diasDoMes,
		Matriculas: matriculas,
	}

	c.JSON(http.StatusOK, resposta)
}

// getDiasMes retorna todos os dias de um determinado mês
func getDiasMes(mes, ano int) []string {
	dias := []string{}
	
	// Determinar o último dia do mês
	var ultimoDia int
	switch mes {
	case 2:
		// Fevereiro - verificar ano bissexto
		if ano%4 == 0 && (ano%100 != 0 || ano%400 == 0) {
			ultimoDia = 29
		} else {
			ultimoDia = 28
		}
	case 4, 6, 9, 11:
		ultimoDia = 30
	default:
		ultimoDia = 31
	}
	
	// Gerar array de datas
	for dia := 1; dia <= ultimoDia; dia++ {
		data := time.Date(ano, time.Month(mes), dia, 0, 0, 0, 0, time.UTC)
		dias = append(dias, data.Format("2006-01-02"))
	}
	
	return dias
}