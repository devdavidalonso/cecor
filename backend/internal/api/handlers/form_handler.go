// internal/api/handlers/form_handlers.go
package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// CreateForm cria um novo formulário
func CreateForm(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// Iniciar transação
		tx := formRepo.GetDB().Begin()

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
}

// ListForms lista formulários com paginação e filtros
func ListForms(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		offsetStr := c.DefaultQuery("offset", "0")
		limitStr := c.DefaultQuery("limit", "20")
		title := c.Query("title")
		formType := c.Query("type")
		audience := c.Query("target_audience")
		status := c.Query("status")

		offset, _ := strconv.Atoi(offsetStr)
		limit, _ := strconv.Atoi(limitStr)

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
}

// GetFormDetails obtém detalhes de um formulário específico
func GetFormDetails(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		// Obter formulário com perguntas
		form, err := formRepo.FindByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, form)
	}
}

// UpdateForm atualiza um formulário existente
func UpdateForm(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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
		if err := formRepo.Update(&form); err != nil {
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
}

// DeleteForm exclui um formulário (soft delete)
func DeleteForm(formRepo *repositories.FormRepository, formResponseRepo *repositories.FormResponseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		// Verificar se existem respostas para este formulário
		hasResponses, err := formResponseRepo.ExistsByFormID(id)
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

			if err := formRepo.Update(&form); err != nil {
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
}

// AddFormQuestion adiciona uma nova pergunta a um formulário existente
func AddFormQuestion(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// Verificar se o formulário existe
		_, err = formRepo.FindByID(formID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
			return
		}

		// Verificar se o ConditionalParentID é válido, se fornecido
		if req.ConditionalParentID != nil {
			var count int64
			db := formRepo.GetDB()
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
		if err := formRepo.CreateQuestion(question); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar pergunta", "details": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, question)
	}
}

// UpdateFormQuestion atualiza uma pergunta existente
func UpdateFormQuestion(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		db := formRepo.GetDB()

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
		if err := formRepo.UpdateQuestion(&question); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar pergunta"})
			return
		}

		c.JSON(http.StatusOK, question)
	}
}

// DeleteFormQuestion exclui uma pergunta de um formulário
func DeleteFormQuestion(formRepo *repositories.FormRepository, formResponseRepo *repositories.FormResponseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		db := formRepo.GetDB()

		// Verificar se a pergunta existe
		var question models.FormQuestion
		if err := db.First(&question, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pergunta não encontrada"})
			return
		}

		// Verificar se há respostas para esta pergunta
		hasAnswers, err := formResponseRepo.HasAnswersForQuestion(id)
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
		if err := formRepo.DeleteQuestion(id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao excluir pergunta"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pergunta excluída com sucesso"})
	}
}

// SubmitFormResponse registra uma resposta a um formulário
func SubmitFormResponse(formRepo *repositories.FormRepository, formResponseRepo *repositories.FormResponseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// Iniciar transação
		db := formRepo.GetDB()
		tx := db.Begin()

		// Criar registro de resposta
		response := &models.FormResponse{
			FormID:           req.FormID,
			UserID:           userID,
			SubmissionDate:   time.Now(),
			CompletionStatus: "complete", // Pode ser dinâmico se implementar resposta parcial
			IPAddress:        c.ClientIP(),
		}

		if err := formResponseRepo.Create(response); err != nil {
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

			if err := formResponseRepo.CreateAnswerDetail(answerDetail); err != nil {
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
}

// GetMyFormResponses retorna as respostas de formulários do usuário logado
func GetMyFormResponses(formResponseRepo *repositories.FormResponseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		responses, err := formResponseRepo.FindByUserID(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao buscar respostas"})
			return
		}

		c.JSON(http.StatusOK, responses)
	}
}

// ListAllFormResponses lista todas as respostas de formulários (admin)
func ListAllFormResponses(formResponseRepo *repositories.FormResponseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		responses, total, err := formResponseRepo.FindWithPagination(formID, offset, limit)
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
}

// GetFormResponseDetails retorna detalhes de uma resposta específica
func GetFormResponseDetails(formResponseRepo *repositories.FormResponseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		response, err := formResponseRepo.FindByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Resposta não encontrada"})
			return
		}

		c.JSON(http.StatusOK, response)
	}
}

// GetMyInterviews retorna as entrevistas do usuário logado
func GetMyInterviews(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		db := formRepo.GetDB()

		var interviews []models.Interview
		if err := db.Where("user_id = ?", userID).Find(&interviews).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao buscar entrevistas"})
			return
		}

		c.JSON(http.StatusOK, interviews)
	}
}

// GetInterviewDetails retorna detalhes de uma entrevista específica
func GetInterviewDetails(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		interview, err := formRepo.GetInterview(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrevista não encontrada"})
			return
		}

		// Verificar se o usuário tem permissão para ver esta entrevista
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		userRoleVal, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Perfil de usuário não encontrado"})
			return
		}
		userRole := userRoleVal.(string)

		// Apenas o entrevistado, o entrevistador ou um admin pode ver os detalhes
		if interview.UserID != userID && interview.InterviewerID != &userID && userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sem permissão para ver esta entrevista"})
			return
		}

		// Carregar formulário associado
		var form models.Form
		if err := formRepo.GetDB().First(&form, interview.FormID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao carregar detalhes do formulário"})
			return
		}

		response := struct {
			Interview models.Interview `json:"interview"`
			Form      models.Form      `json:"form"`
		}{
			Interview: interview,
			Form:      form,
		}

		c.JSON(http.StatusOK, response)
	}
}

// ListInterviews lista todas as entrevistas (admin)
func ListInterviews(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		interviews, err := formRepo.ListInterviews()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao listar entrevistas"})
			return
		}

		c.JSON(http.StatusOK, interviews)
	}
}

// ScheduleInterview agenda uma nova entrevista
func ScheduleInterview(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			FormID        uint      `json:"form_id" binding:"required"`
			UserID        uint      `json:"user_id" binding:"required"`
			ScheduledDate time.Time `json:"scheduled_date" binding:"required"`
			InterviewerID *uint     `json:"interviewer_id"`
			Notes         string    `json:"notes"`
			TriggerType   string    `json:"trigger_type"`
			RelatedEntity string    `json:"related_entity"`
			RelatedID     *uint     `json:"related_id"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
			return
		}

		// // Obter ID do usuário autenticado
		// adminIDVal, exists := c.Get("userID")
		// if !exists {
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		// 	return
		// }
		// // adminID := adminIDVal.(uint)

		// Verificar se o formulário existe
		_, err := formRepo.FindByID(req.FormID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Formulário não encontrado"})
			return
		}

		// Criar entrevista
		interview := &models.Interview{
			FormID:        req.FormID,
			UserID:        req.UserID,
			ScheduledDate: req.ScheduledDate,
			InterviewerID: req.InterviewerID,
			Notes:         req.Notes,
			Status:        "scheduled",
			TriggerType:   req.TriggerType,
			RelatedEntity: req.RelatedEntity,
			RelatedID:     req.RelatedID,
			ReminderSent:  false,
		}

		if err := formRepo.CreateInterview(interview); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao agendar entrevista"})
			return
		}

		// Notificar usuário (implementação simplificada)
		// TODO: Implementar notificação real
		c.JSON(http.StatusCreated, gin.H{
			"message":   "Entrevista agendada com sucesso",
			"interview": interview,
		})
	}
}

// UpdateInterview atualiza uma entrevista existente
func UpdateInterview(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		var req struct {
			ScheduledDate time.Time `json:"scheduled_date"`
			InterviewerID *uint     `json:"interviewer_id"`
			Notes         string    `json:"notes"`
			Status        string    `json:"status" binding:"omitempty,oneof=scheduled completed canceled rescheduled"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
			return
		}

		// Verificar se a entrevista existe
		interview, err := formRepo.GetInterview(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrevista não encontrada"})
			return
		}

		// Atualizar campos
		if !req.ScheduledDate.IsZero() {
			interview.ScheduledDate = req.ScheduledDate
		}
		if req.InterviewerID != nil {
			interview.InterviewerID = req.InterviewerID
		}
		if req.Notes != "" {
			interview.Notes = req.Notes
		}
		if req.Status != "" {
			interview.Status = req.Status

			// Se foi completada, registrar data de conclusão
			if req.Status == "completed" {
				now := time.Now()
				interview.CompletionDate = &now
			}
		}

		if err := formRepo.UpdateInterview(&interview); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar entrevista"})
			return
		}

		c.JSON(http.StatusOK, interview)
	}
}

// CancelInterview cancela uma entrevista
func CancelInterview(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		var req struct {
			Reason string `json:"reason"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido"})
			return
		}

		// Verificar se a entrevista existe
		interview, err := formRepo.GetInterview(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrevista não encontrada"})
			return
		}

		// Verificar se já foi cancelada ou concluída
		if interview.Status == "canceled" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Entrevista já está cancelada"})
			return
		}
		if interview.Status == "completed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Não é possível cancelar uma entrevista já concluída"})
			return
		}

		// Atualizar status e notas
		interview.Status = "canceled"
		if req.Reason != "" {
			if interview.Notes != "" {
				interview.Notes += "\n\n"
			}
			interview.Notes += "Motivo do cancelamento: " + req.Reason
		}

		if err := formRepo.UpdateInterview(&interview); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao cancelar entrevista"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "Entrevista cancelada com sucesso",
			"interview": interview,
		})
	}
}

// CompleteInterview marca uma entrevista como concluída
func CompleteInterview(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		var req struct {
			Notes string `json:"notes"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido"})
			return
		}

		// Verificar se a entrevista existe
		interview, err := formRepo.GetInterview(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrevista não encontrada"})
			return
		}

		// Verificar status atual
		if interview.Status == "completed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Entrevista já está concluída"})
			return
		}
		if interview.Status == "canceled" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Não é possível concluir uma entrevista cancelada"})
			return
		}

		// Atualizar status, data de conclusão e notas
		interview.Status = "completed"
		now := time.Now()
		interview.CompletionDate = &now

		if req.Notes != "" {
			if interview.Notes != "" {
				interview.Notes += "\n\n"
			}
			interview.Notes += "Notas de conclusão: " + req.Notes
		}

		if err := formRepo.UpdateInterview(&interview); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao concluir entrevista"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "Entrevista concluída com sucesso",
			"interview": interview,
		})
	}
}

// RescheduleInterview reagenda uma entrevista
func RescheduleInterview(formRepo *repositories.FormRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		var req struct {
			NewDate time.Time `json:"new_date" binding:"required"`
			Reason  string    `json:"reason"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
			return
		}

		// Verificar se a entrevista existe
		interview, err := formRepo.GetInterview(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrevista não encontrada"})
			return
		}

		// Verificar status atual
		if interview.Status == "completed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Não é possível reagendar uma entrevista já concluída"})
			return
		}
		if interview.Status == "canceled" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Não é possível reagendar uma entrevista cancelada"})
			return
		}

		// Salvar data anterior para registro
		oldDate := interview.ScheduledDate

		// Atualizar status, data e notas
		interview.Status = "rescheduled"
		interview.ScheduledDate = req.NewDate

		if req.Reason != "" {
			if interview.Notes != "" {
				interview.Notes += "\n\n"
			}
			interview.Notes += fmt.Sprintf("Reagendamento: de %s para %s. Motivo: %s",
				oldDate.Format("02/01/2006 15:04"),
				req.NewDate.Format("02/01/2006 15:04"),
				req.Reason)
		}

		if err := formRepo.UpdateInterview(&interview); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao reagendar entrevista"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "Entrevista reagendada com sucesso",
			"interview": interview,
		})
	}
}
