package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/devdavidalonso/cecor/backend/internal/api/middleware"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/alunos"
	"github.com/devdavidalonso/cecor/backend/pkg/errors"
)

// PaginatedResponse é uma estrutura para respostas paginadas
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalItems int64       `json:"totalItems"`
	TotalPages int64       `json:"totalPages"`
}

// AlunoHandler implementa os handlers HTTP para o recurso alunos
type AlunoHandler struct {
	alunoService alunos.Service
}

// NewAlunoHandler cria uma nova instância de AlunoHandler
func NewAlunoHandler(alunoService alunos.Service) *AlunoHandler {
	return &AlunoHandler{
		alunoService: alunoService,
	}
}

// GetAlunos retorna uma lista paginada de alunos
// @Summary Listar alunos
// @Description Retorna uma lista paginada de alunos com opções de filtro
// @Tags alunos
// @Accept json
// @Produce json
// @Param page query int false "Número da página (padrão: 1)"
// @Param pageSize query int false "Tamanho da página (padrão: 20, max: 100)"
// @Param nome query string false "Filtrar por nome"
// @Param email query string false "Filtrar por email"
// @Param cpf query string false "Filtrar por CPF"
// @Param status query string false "Filtrar por status"
// @Param curso_id query int false "Filtrar por curso"
// @Success 200 {object} PaginatedResponse{data=[]models.Aluno}
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos [get]
func (h *AlunoHandler) GetAlunos(w http.ResponseWriter, r *http.Request) {
	// Obter parâmetros de paginação
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if err != nil || pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	// Obter filtros
	filtros := make(map[string]interface{})

	if nome := r.URL.Query().Get("nome"); nome != "" {
		filtros["nome"] = nome
	}

	if email := r.URL.Query().Get("email"); email != "" {
		filtros["email"] = email
	}

	if cpf := r.URL.Query().Get("cpf"); cpf != "" {
		filtros["cpf"] = cpf
	}

	if status := r.URL.Query().Get("status"); status != "" {
		filtros["status"] = status
	}

	if cursoID := r.URL.Query().Get("curso_id"); cursoID != "" {
		if id, err := strconv.Atoi(cursoID); err == nil {
			filtros["curso_id"] = id
		}
	}

	// Chamar o serviço
	alunos, total, err := h.alunoService.GetAlunos(r.Context(), page, pageSize, filtros)
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Montar resposta paginada
	response := PaginatedResponse{
		Data:       alunos,
		Page:       page,
		PageSize:   pageSize,
		TotalItems: total,
		TotalPages: (total + int64(pageSize) - 1) / int64(pageSize),
	}

	errors.RespondWithJSON(w, http.StatusOK, response)
}

// GetAluno retorna um aluno específico pelo ID
// @Summary Obter aluno
// @Description Retorna os detalhes de um aluno específico
// @Tags alunos
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Success 200 {object} models.Aluno
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id} [get]
func (h *AlunoHandler) GetAluno(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Chamar o serviço
	aluno, err := h.alunoService.GetAlunoPorID(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, aluno)
}

// CreateAluno cria um novo aluno
// @Summary Criar aluno
// @Description Cria um novo registro de aluno
// @Tags alunos
// @Accept json
// @Produce json
// @Param aluno body models.Aluno true "Dados do aluno"
// @Success 201 {object} models.Aluno
// @Failure 400 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos [post]
func (h *AlunoHandler) CreateAluno(w http.ResponseWriter, r *http.Request) {
	var aluno models.Aluno

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&aluno); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Obter usuário do contexto (para auditoria)
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		errors.RespondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	// Chamar o serviço
	err := h.alunoService.CriarAluno(r.Context(), &aluno)
	if err != nil {
		// Verificar tipo de erro
		if err.Error() == "já existe um aluno com este e-mail" ||
			err.Error() == "já existe um aluno com este CPF" ||
			err.Error() == "nome é obrigatório" ||
			err.Error() == "e-mail é obrigatório" ||
			err.Error() == "telefone principal é obrigatório" ||
			err.Error() == "data de nascimento é obrigatória" {
			errors.RespondWithError(w, http.StatusBadRequest, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusCreated, aluno)
}

// UpdateAluno atualiza um aluno existente
// @Summary Atualizar aluno
// @Description Atualiza os dados de um aluno existente
// @Tags alunos
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Param aluno body models.Aluno true "Dados do aluno"
// @Success 200 {object} models.Aluno
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id} [put]
func (h *AlunoHandler) UpdateAluno(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	var aluno models.Aluno

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&aluno); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Garantir que o ID na URL seja usado
	aluno.ID = uint(id)

	// Chamar o serviço
	err = h.alunoService.AtualizarAluno(r.Context(), &aluno)
	if err != nil {
		// Verificar tipo de erro
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else if err.Error() == "já existe outro aluno com este e-mail" ||
			err.Error() == "já existe outro aluno com este CPF" {
			errors.RespondWithError(w, http.StatusBadRequest, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	// Buscar o aluno atualizado para retornar
	alunoAtualizado, err := h.alunoService.GetAlunoPorID(r.Context(), uint(id))
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, "Erro ao buscar aluno atualizado")
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, alunoAtualizado)
}

// DeleteAluno exclui um aluno
// @Summary Excluir aluno
// @Description Remove um aluno do sistema (exclusão lógica)
// @Tags alunos
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Success 204 "No Content"
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id} [delete]
func (h *AlunoHandler) DeleteAluno(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Chamar o serviço
	err = h.alunoService.ExcluirAluno(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	// Responder com sucesso sem conteúdo
	w.WriteHeader(http.StatusNoContent)
}

// GetResponsaveis retorna os responsáveis de um aluno
// @Summary Listar responsáveis
// @Description Retorna a lista de responsáveis associados a um aluno
// @Tags alunos,responsaveis
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Success 200 {array} models.Responsavel
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id}/responsaveis [get]
func (h *AlunoHandler) GetResponsaveis(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Chamar o serviço
	responsaveis, err := h.alunoService.GetResponsaveis(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, responsaveis)
}

// AddResponsavel adiciona um responsável a um aluno
// @Summary Adicionar responsável
// @Description Adiciona um novo responsável a um aluno
// @Tags alunos,responsaveis
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Param responsavel body models.Responsavel true "Dados do responsável"
// @Success 201 {object} models.Responsavel
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id}/responsaveis [post]
func (h *AlunoHandler) AddResponsavel(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	var responsavel models.Responsavel

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&responsavel); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Garantir que o ID do aluno seja o da URL
	responsavel.AlunoID = uint(id)

	// Chamar o serviço
	err = h.alunoService.AdicionarResponsavel(r.Context(), &responsavel)
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else if err.Error() == "nome do responsável é obrigatório" ||
			err.Error() == "grau de parentesco é obrigatório" ||
			err.Error() == "limite de 3 responsáveis por aluno atingido" {
			errors.RespondWithError(w, http.StatusBadRequest, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusCreated, responsavel)
}

// UpdateResponsavel atualiza um responsável
// @Summary Atualizar responsável
// @Description Atualiza os dados de um responsável existente
// @Tags responsaveis
// @Accept json
// @Produce json
// @Param id path int true "ID do responsável"
// @Param responsavel body models.Responsavel true "Dados do responsável"
// @Success 200 {object} models.Responsavel
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/responsaveis/{id} [put]
func (h *AlunoHandler) UpdateResponsavel(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	var responsavel models.Responsavel

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&responsavel); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Garantir que o ID seja o da URL
	responsavel.ID = uint(id)

	// Chamar o serviço
	err = h.alunoService.AtualizarResponsavel(r.Context(), &responsavel)
	if err != nil {
		if err.Error() == "responsável não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, responsavel)
}

// DeleteResponsavel remove um responsável
// @Summary Remover responsável
// @Description Remove um responsável do sistema
// @Tags responsaveis
// @Accept json
// @Produce json
// @Param id path int true "ID do responsável"
// @Success 204 "No Content"
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/responsaveis/{id} [delete]
func (h *AlunoHandler) DeleteResponsavel(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Chamar o serviço
	err = h.alunoService.RemoverResponsavel(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "responsável não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	// Responder com sucesso sem conteúdo
	w.WriteHeader(http.StatusNoContent)
}

// GetDocumentos retorna os documentos de um aluno
// @Summary Listar documentos
// @Description Retorna a lista de documentos associados a um aluno
// @Tags alunos,documentos
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Success 200 {array} models.Documento
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id}/documentos [get]
func (h *AlunoHandler) GetDocumentos(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Chamar o serviço
	documentos, err := h.alunoService.GetDocumentos(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, documentos)
}

// AddDocumento adiciona um documento a um aluno
// @Summary Adicionar documento
// @Description Adiciona um novo documento a um aluno
// @Tags alunos,documentos
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Param documento body models.Documento true "Dados do documento"
// @Success 201 {object} models.Documento
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id}/documentos [post]
func (h *AlunoHandler) AddDocumento(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	var documento models.Documento

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&documento); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Garantir que o ID do aluno seja o da URL
	documento.AlunoID = uint(id)

	// Obter usuário do contexto para o campo CarregadoPorID
	userClaims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		errors.RespondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}
	documento.CarregadoPorID = uint(userClaims.UserID)

	// Chamar o serviço
	err = h.alunoService.AdicionarDocumento(r.Context(), &documento)
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else if err.Error() == "nome do documento é obrigatório" ||
			err.Error() == "tipo do documento é obrigatório" ||
			err.Error() == "caminho do documento é obrigatório" {
			errors.RespondWithError(w, http.StatusBadRequest, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusCreated, documento)
}

// DeleteDocumento remove um documento
// @Summary Remover documento
// @Description Remove um documento do sistema
// @Tags documentos
// @Accept json
// @Produce json
// @Param id path int true "ID do documento"
// @Success 204 "No Content"
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/documentos/{id} [delete]
func (h *AlunoHandler) DeleteDocumento(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Chamar o serviço
	err = h.alunoService.RemoverDocumento(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "documento não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	// Responder com sucesso sem conteúdo
	w.WriteHeader(http.StatusNoContent)
}

// GetNotas retorna as notas/observações de um aluno
// @Summary Listar notas/observações
// @Description Retorna a lista de notas e observações de um aluno
// @Tags alunos,notas
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Param incluirConfidenciais query bool false "Incluir notas confidenciais (padrão: false)"
// @Success 200 {array} models.NotaAluno
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id}/notas [get]
func (h *AlunoHandler) GetNotas(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	// Verificar parâmetro para incluir confidenciais
	incluirConfidenciais := false
	if r.URL.Query().Get("incluirConfidenciais") == "true" {
		incluirConfidenciais = true
	}

	// Chamar o serviço
	notas, err := h.alunoService.GetNotas(r.Context(), uint(id), incluirConfidenciais)
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, notas)
}

// AddNota adiciona uma nota/observação a um aluno
// @Summary Adicionar nota/observação
// @Description Adiciona uma nova nota ou observação a um aluno
// @Tags alunos,notas
// @Accept json
// @Produce json
// @Param id path int true "ID do aluno"
// @Param nota body models.NotaAluno true "Dados da nota"
// @Success 201 {object} models.NotaAluno
// @Failure 400 {object} errors.AppError
// @Failure 404 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /api/v1/alunos/{id}/notas [post]
func (h *AlunoHandler) AddNota(w http.ResponseWriter, r *http.Request) {
	// Obter ID da URL
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	var nota models.NotaAluno

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&nota); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Garantir que o ID do aluno seja o da URL
	nota.AlunoID = uint(id)

	// Obter usuário do contexto para o campo AutorID
	userClaims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		errors.RespondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}
	nota.AutorID = uint(userClaims.UserID)

	// Chamar o serviço
	err = h.alunoService.AdicionarNota(r.Context(), &nota)
	if err != nil {
		if err.Error() == "aluno não encontrado" {
			errors.RespondWithError(w, http.StatusNotFound, err.Error())
		} else if err.Error() == "conteúdo da nota é obrigatório" {
			errors.RespondWithError(w, http.StatusBadRequest, err.Error())
		} else {
			errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	errors.RespondWithJSON(w, http.StatusCreated, nota)
}
