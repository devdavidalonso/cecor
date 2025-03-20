// internal/api/handlers/form_handlers.go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateForm cria um novo formulário
func CreateForm(c *gin.Context) {
	var req struct {
		Title          string `json:"title" binding:"required"`
		Description    string `json:"description"`
		Type           string `json:"type" binding:"required,oneof=enrollment feedback evaluation"`
		IsRequired     bool   `json:"is_required"`
		TargetAudience string `json:"target_audience" binding:"required,oneof=student guardian teacher"`
		Status         string `json:"status" binding:"required,oneof=draft active inactive"`
		Questions      []struct {
			QuestionText        string `json:"question_text" binding:"required"`
			HelpText            string `json:"help_text"`
			QuestionType        string `json:"question_type" binding:"required,oneof=text multiple_choice likert file date"`
			Options             string `json:"options"`
			IsRequired          bool   `json:"is_required"`
			DisplayOrder        int    `json:"display_order" binding:"required,min=1"`
			ConditionalParentID *uint  `json:"conditional_parent_id"`
			ConditionalValue    string `json:"conditional_value"`
			ValidationRules     string `json:"validation_rules"`
		} `json:"questions"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	// Obter ID do usuário autenticado
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)

	// Iniciar transação
	tx := db.Begin()

	// Criar formulário
	form := &models.Form{
		Title:          req.Title,
		Description:    req.Description,
		Type:           req.Type,
		IsRequired:     req.IsRequired,
		TargetAudience: req.TargetAudience,
		Status:         req.Status,
		CreatedBy:      userID,
	}

	// Criar formulário na transação
	if err := tx.Create(form).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar formulário", "details": err.Error()})
		return
	}

	// Adicionar perguntas se fornecidas
	for _, q := range req.Questions {
		question := &models.FormQuestion{
			FormID:              form.ID,
			QuestionText:        q.QuestionText,
			HelpText:            q.HelpText,
			QuestionType:        q.QuestionType,
			Options:             q.Options,
			IsRequired:          q.IsRequired,
			DisplayOrder:        q.DisplayOrder,
			ConditionalParentID: q.ConditionalParentID,
			ConditionalValue:    q.ConditionalValue,
			ValidationRules:     q.ValidationRules,
		}

		if err := tx.Create(question).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar pergunta", "details": err.Error()})
			return
		}
	}

	// Confirmar transação
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao confirmar transação", "details": err.Error()})
		return
	}

	// Obter o formulário criado com perguntas
	createdForm, err := formRepo.FindByID(form.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Formulário criado mas falha ao buscar detalhes"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Formulário criado com sucesso",
		"form":    createdForm,
	})
}

// ListForms lista formulários com paginação e filtros
func ListForms(c *gin.Context) {
	offsetStr := c.DefaultQuery("offset", "0")
	limitStr := c.DefaultQuery("limit", "20")
	title := c.Query("title")
	formType := c.Query("type")
	audience := c.Query("target_audience")
	status := c.Query("status")

	offset, _ := strconv.Atoi(offsetStr)
	limit, _ := strconv.Atoi(limitStr)

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)

	// Preparar filtros
	filters := map[string]interface{}{
		"title":           title,
		"type":            formType,
		"target_audience": audience,
		"status":          status,
	}

	// Obter formulários com paginação
	forms, total, err := formRepo.FindWithFilters(offset, limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao listar formulários"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"forms":  forms,
		"total":  total,
		"offset": offset,
		"limit":  limit,
	})
}

// GetFormDetails obtém detalhes de um formulário específico
func GetFormDetails(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)

	// Obter formulário com perguntas
	form, err := formRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, form)
}

// UpdateForm atualiza um formulário existente
func UpdateForm(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	var req struct {
		Title          string `json:"title"`
		Description    string `json:"description"`
		Type           string `json:"type" binding:"omitempty,oneof=enrollment feedback evaluation"`
		IsRequired     *bool  `json:"is_required"`
		TargetAudience string `json:"target_audience" binding:"omitempty,oneof=student guardian teacher"`
		Status         string `json:"status" binding:"omitempty,oneof=draft active inactive"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)

	// Verificar se o formulário existe
	form, err := formRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
		return
	}

	// Atualizar campos
	if req.Title != "" {
		form.Title = req.Title
	}
	if req.Description != "" {
		form.Description = req.Description
	}
	if req.Type != "" {
		form.Type = req.Type
	}
	if req.IsRequired != nil {
		form.IsRequired = *req.IsRequired
	}
	if req.TargetAudience != "" {
		form.TargetAudience = req.TargetAudience
	}
	if req.Status != "" {
		form.Status = req.Status
	}

	form.UpdatedAt = time.Now()

	// Salvar alterações
	if err := formRepo.Update(form); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar formulário"})
		return
	}

	// Buscar formulário atualizado
	updatedForm, err := formRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Formulário atualizado mas falha ao buscar detalhes"})
		return
	}

	c.JSON(http.StatusOK, updatedForm)
}

// DeleteForm exclui um formulário (soft delete)
func DeleteForm(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)
	responseRepo := repositories.NewFormResponseRepository(db)

	// Verificar se existem respostas para este formulário
	hasResponses, err := responseRepo.ExistsByFormID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao verificar respostas"})
		return
	}

	if hasResponses {
		// Se houver respostas, apenas marcar como inativo em vez de excluir
		form, err := formRepo.FindByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
			return
		}

		form.Status = "inactive"
		form.UpdatedAt = time.Now()

		if err := formRepo.Update(form); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao inativar formulário"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Formulário inativado (possui respostas, não pode ser excluído)",
		})
		return
	}

	// Se não houver respostas, excluir (soft delete)
	if err := formRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao excluir formulário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Formulário excluído com sucesso"})
}

// AddFormQuestion adiciona uma nova pergunta a um formulário existente
func AddFormQuestion(c *gin.Context) {
	formIDStr := c.Param("id")
	formIDInt, err := strconv.Atoi(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de formulário inválido"})
		return
	}
	formID := uint(formIDInt)

	var req struct {
		QuestionText        string `json:"question_text" binding:"required"`
		HelpText            string `json:"help_text"`
		QuestionType        string `json:"question_type" binding:"required,oneof=text multiple_choice likert file date"`
		Options             string `json:"options"`
		IsRequired          bool   `json:"is_required"`
		DisplayOrder        int    `json:"display_order" binding:"required,min=1"`
		ConditionalParentID *uint  `json:"conditional_parent_id"`
		ConditionalValue    string `json:"conditional_value"`
		ValidationRules     string `json:"validation_rules"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)

	// Verificar se o formulário existe
	_, err = formRepo.FindByID(formID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
		return
	}

	// Verificar se o ConditionalParentID é válido, se fornecido
	if req.ConditionalParentID != nil {
		var count int64
		result := db.Model(&models.FormQuestion{}).Where("id = ? AND form_id = ?", *req.ConditionalParentID, formID).Count(&count)
		if result.Error != nil || count == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ConditionalParentID inválido ou não pertence a este formulário"})
			return
		}
	}

	// Criar nova pergunta
	question := &models.FormQuestion{
		FormID:              formID,
		QuestionText:        req.QuestionText,
		HelpText:            req.HelpText,
		QuestionType:        req.QuestionType,
		Options:             req.Options,
		IsRequired:          req.IsRequired,
		DisplayOrder:        req.DisplayOrder,
		ConditionalParentID: req.ConditionalParentID,
		ConditionalValue:    req.ConditionalValue,
		ValidationRules:     req.ValidationRules,
	}

	// Salvar pergunta
	if err := db.Create(question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar pergunta", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, question)
}

// UpdateFormQuestion atualiza uma pergunta existente
func UpdateFormQuestion(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	var req struct {
		QuestionText        string `json:"question_text"`
		HelpText            string `json:"help_text"`
		QuestionType        string `json:"question_type" binding:"omitempty,oneof=text multiple_choice likert file date"`
		Options             string `json:"options"`
		IsRequired          *bool  `json:"is_required"`
		DisplayOrder        int    `json:"display_order" binding:"omitempty,min=1"`
		ConditionalParentID *uint  `json:"conditional_parent_id"`
		ConditionalValue    string `json:"conditional_value"`
		ValidationRules     string `json:"validation_rules"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	db := c.MustGet("db").(*gorm.DB)

	// Verificar se a pergunta existe
	var question models.FormQuestion
	if err := db.First(&question, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pergunta não encontrada"})
		return
	}

	// Verificar se o ConditionalParentID é válido e não cria um ciclo, se fornecido
	if req.ConditionalParentID != nil && *req.ConditionalParentID != 0 {
		// Não pode depender de si mesmo
		if *req.ConditionalParentID == id {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Uma pergunta não pode depender de si mesma"})
			return
		}

		// Verificar se a pergunta pai pertence ao mesmo formulário
		var count int64
		result := db.Model(&models.FormQuestion{}).Where("id = ? AND form_id = ?", *req.ConditionalParentID, question.FormID).Count(&count)
		if result.Error != nil || count == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ConditionalParentID inválido ou não pertence a este formulário"})
			return
		}

		// Verificar ciclos (implementação simplificada)
		// Uma verificação completa exigiria um algoritmo de detecção de ciclos em grafos
	}

	// Atualizar campos
	if req.QuestionText != "" {
		question.QuestionText = req.QuestionText
	}
	if req.HelpText != "" {
		question.HelpText = req.HelpText
	}
	if req.QuestionType != "" {
		question.QuestionType = req.QuestionType
	}
	if req.Options != "" {
		question.Options = req.Options
	}
	if req.IsRequired != nil {
		question.IsRequired = *req.IsRequired
	}
	if req.DisplayOrder > 0 {
		question.DisplayOrder = req.DisplayOrder
	}

	question.ConditionalParentID = req.ConditionalParentID
	question.ConditionalValue = req.ConditionalValue

	if req.ValidationRules != "" {
		question.ValidationRules = req.ValidationRules
	}

	// Salvar alterações
	if err := db.Save(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar pergunta"})
		return
	}

	c.JSON(http.StatusOK, question)
}

// DeleteFormQuestion exclui uma pergunta de um formulário
func DeleteFormQuestion(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	responseRepo := repositories.NewFormResponseRepository(db)

	// Verificar se a pergunta existe
	var question models.FormQuestion
	if err := db.First(&question, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pergunta não encontrada"})
		return
	}

	// Verificar se há respostas para esta pergunta
	hasAnswers, err := responseRepo.HasAnswersForQuestion(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao verificar respostas"})
		return
	}

	if hasAnswers {
		c.JSON(http.StatusConflict, gin.H{"error": "Não é possível excluir uma pergunta que já possui respostas"})
		return
	}

	// Verificar se outras perguntas dependem desta (para condicionais)
	var dependentCount int64
	if err := db.Model(&models.FormQuestion{}).Where("conditional_parent_id = ?", id).Count(&dependentCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao verificar dependências"})
		return
	}

	if dependentCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Não é possível excluir uma pergunta que é referenciada como condicional por outras perguntas"})
		return
	}

	// Excluir pergunta
	if err := db.Delete(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao excluir pergunta"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pergunta excluída com sucesso"})
}

// SubmitFormResponse registra uma resposta a um formulário
func SubmitFormResponse(c *gin.Context) {
	var req struct {
		FormID  uint `json:"form_id" binding:"required"`
		Answers []struct {
			QuestionID    uint   `json:"question_id" binding:"required"`
			AnswerText    string `json:"answer_text"`
			AnswerOptions string `json:"answer_options"`
			FileURL       string `json:"file_url"`
		} `json:"answers" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	// Obter ID do usuário autenticado
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	db := c.MustGet("db").(*gorm.DB)
	formRepo := repositories.NewFormRepository(db)

	// Verificar se o formulário existe
	form, err := formRepo.FindByID(req.FormID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
		return
	}

	// Verificar se o formulário está ativo
	if form.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Este formulário não está disponível para respostas"})
		return
	}

	// Verificar se o usuário já respondeu este formulário (opcional, dependendo dos requisitos)
	/*
		responseRepo := repositories.NewFormResponseRepository(db)
		alreadyResponded, err := responseRepo.HasUserRespondedForm(userID, req.FormID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao verificar respostas anteriores"})
			return
		}

		if alreadyResponded {
			c.JSON(http.StatusConflict, gin.H{"error": "Você já respondeu este formulário"})
			return
		}
	*/

	// Iniciar transação
	tx := db.Begin()

	// Criar registro de resposta
	response := &models.FormResponse{
		FormID:           req.FormID,
		UserID:           userID,
		SubmissionDate:   time.Now(),
		CompletionStatus: "complete", // Pode ser dinâmico se implementar resposta parcial
		IPAddress:        c.ClientIP(),
	}

	if err := tx.Create(response).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao registrar resposta"})
		return
	}

	// Processar respostas às perguntas
	for _, answer := range req.Answers {
		// Verificar se a pergunta pertence ao formulário
		var question models.FormQuestion
		if err := tx.Where("id = ? AND form_id = ?", answer.QuestionID, req.FormID).First(&question).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Pergunta inválida ou não pertence a este formulário", "question_id": answer.QuestionID})
			return
		}

		// Verificar resposta de acordo com o tipo de pergunta
		switch question.QuestionType {
		case "text", "date":
			if answer.AnswerText == "" && question.IsRequired {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "Resposta obrigatória não fornecida", "question_id": question.ID})
				return
			}
		case "multiple_choice":
			if answer.AnswerOptions == "" && question.IsRequired {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "Resposta obrigatória não fornecida", "question_id": question.ID})
				return
			}
			// Aqui poderia validar se as opções selecionadas são válidas comparando com question.Options
		case "likert":
			if answer.AnswerText == "" && question.IsRequired {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "Resposta obrigatória não fornecida", "question_id": question.ID})
				return
			}
			// Aqui poderia validar se o valor está dentro da escala
		case "file":
			if answer.FileURL == "" && question.IsRequired {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo obrigatório não fornecido", "question_id": question.ID})
				return
			}
		}

		// Criar registro de detalhe da resposta
		answerDetail := &models.FormAnswerDetail{
			ResponseID:    response.ID,
			QuestionID:    answer.QuestionID,
			AnswerText:    answer.AnswerText,
			AnswerOptions: answer.AnswerOptions,
			FileURL:       answer.FileURL,
		}

		if err := tx.Create(answerDetail).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao registrar resposta à pergunta"})
			return
		}
	}

	// Confirmar transação
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao confirmar transação"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Resposta registrada com sucesso",
		"response_id": response.ID,
	})
}

// GetMyFormResponses retorna as respostas de formulários do usuário logado
func GetMyFormResponses(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	db := c.MustGet("db").(*gorm.DB)
	responseRepo := repositories.NewFormResponseRepository(db)

	responses, err := responseRepo.FindByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao buscar respostas"})
		return
	}

	c.JSON(http.StatusOK, responses)
}

// ListAllFormResponses lista todas as respostas de formulários (admin)
func ListAllFormResponses(c *gin.Context) {
	formIDStr := c.Query("form_id")
	offsetStr := c.DefaultQuery("offset", "0")
	limitStr := c.DefaultQuery("limit", "20")

	offset, _ := strconv.Atoi(offsetStr)
	limit, _ := strconv.Atoi(limitStr)

	var formID *uint
	if formIDStr != "" {
		formIDInt, err := strconv.Atoi(formIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de formulário inválido"})
			return
		}
		formIDUint := uint(formIDInt)
		formID = &formIDUint
	}

	db := c.MustGet("db").(*gorm.DB)
	responseRepo := repositories.NewFormResponseRepository(db)

	responses, total, err := responseRepo.FindWithPagination(formID, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao buscar respostas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"responses": responses,
		"total":     total,
		"offset":    offset,
		"limit":     limit,
	})
}

// GetFormResponseDetails retorna detalhes de uma resposta específica
func GetFormResponseDetails(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	responseRepo := repositories.NewFormResponseRepository(db)

	response, err := responseRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resposta não encontrada"})
		return
	}

	c.JSON(http.StatusOK, response)
}
