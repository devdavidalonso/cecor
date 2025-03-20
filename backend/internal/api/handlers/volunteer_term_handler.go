// internal/api/handlers/volunteer_term_handlers.go
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

// SignVolunteerTerm handles the signing of a volunteer term by a teacher
func SignVolunteerTerm(c *gin.Context) {
	var req struct {
		TemplateID uint   `json:"template_id" binding:"required"`
		DeviceInfo string `json:"device_info"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	// Obter ID do usuário autenticado (professor)
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	// Verificar perfil do usuário
	userRoleVal, exists := c.Get("userRole")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Perfil de usuário não encontrado"})
		return
	}
	userRole := userRoleVal.(string)

	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Apenas professores podem assinar termos de voluntariado"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Verificar se o modelo existe e está ativo
	template, err := termRepo.GetTermTemplateByID(req.TemplateID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modelo de termo não encontrado"})
		return
	}

	if !template.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Não é possível assinar um modelo de termo inativo"})
		return
	}

	// Verificar se o professor já tem um termo ativo
	hasActiveTerm, err := termRepo.HasActiveTermForTeacher(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar termos ativos"})
		return
	}

	if hasActiveTerm {
		c.JSON(http.StatusConflict, gin.H{"error": "Você já possui um termo de voluntariado ativo"})
		return
	}

	// Definir data de expiração (1 ano a partir de agora)
	expirationDate := time.Now().AddDate(1, 0, 0)

	// Criar o termo de voluntariado
	term := models.VolunteerTerm{
		TeacherID:      userID,
		TemplateID:     req.TemplateID,
		SignedAt:       time.Now(),
		ExpirationDate: expirationDate,
		IPAddress:      c.ClientIP(),
		DeviceInfo:     req.DeviceInfo,
		SignatureType:  "digital",
		Status:         "active",
		ReminderSent:   false,
		CreatedBy:      userID,
	}

	// Iniciar transação
	tx := db.Begin()

	// Salvar termo
	if err := tx.Create(&term).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar termo", "details": err.Error()})
		return
	}

	// Registrar ação no histórico
	history := models.VolunteerTermHistory{
		TermID:     term.ID,
		ActionType: "signed",
		ActionDate: time.Now(),
		ActionByID: &userID,
		Details:    "Termo assinado digitalmente",
		CreatedBy:  userID,
	}

	if err := tx.Create(&history).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar histórico", "details": err.Error()})
		return
	}

	// Confirmar transação
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao confirmar transação", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Termo assinado com sucesso",
		"term":    term,
	})
}

// GetMyVolunteerTerms handles retrieving all terms signed by the authenticated teacher
func GetMyVolunteerTerms(c *gin.Context) {
	// Obter ID do usuário autenticado (professor)
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	// Verificar perfil do usuário
	userRoleVal, exists := c.Get("userRole")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Perfil de usuário não encontrado"})
		return
	}
	userRole := userRoleVal.(string)

	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Apenas professores podem acessar termos de voluntariado"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Buscar termos
	terms, err := termRepo.GetVolunteerTermsByTeacherID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar termos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"terms": terms,
		"count": len(terms),
	})
}

// GetCurrentTemplate handles retrieving the current active template
func GetCurrentTemplate(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Buscar modelo ativo
	template, err := termRepo.GetActiveTermTemplate()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nenhum modelo de termo ativo encontrado"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// ListTermTemplates lista todos os modelos de termos (admin)
func ListTermTemplates(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	templates, err := termRepo.GetAllTermTemplates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar modelos de termos"})
		return
	}

	c.JSON(http.StatusOK, templates)
}

// CreateTermTemplate cria um novo modelo de termo (admin)
func CreateTermTemplate(c *gin.Context) {
	var req struct {
		Title    string `json:"title" binding:"required"`
		Content  string `json:"content" binding:"required"`
		Version  string `json:"version" binding:"required"`
		IsActive bool   `json:"is_active"`
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
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Se este novo modelo será ativo, desativar outros modelos ativos
	if req.IsActive {
		if err := termRepo.DeactivateAllTemplates(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar modelos existentes"})
			return
		}
	}

	// Criar modelo
	template := models.VolunteerTermTemplate{
		Title:     req.Title,
		Content:   req.Content,
		Version:   req.Version,
		IsActive:  req.IsActive,
		CreatedBy: userID,
	}

	if err := termRepo.CreateTermTemplate(&template); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar modelo de termo"})
		return
	}

	c.JSON(http.StatusCreated, template)
}

// GetTermTemplateDetails obtém detalhes de um modelo de termo específico
func GetTermTemplateDetails(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	template, err := termRepo.GetTermTemplateByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modelo de termo não encontrado"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// UpdateTermTemplate atualiza um modelo de termo existente
func UpdateTermTemplate(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	var req struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		Version  string `json:"version"`
		IsActive *bool  `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de requisição inválido", "details": err.Error()})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Verificar se o modelo existe
	template, err := termRepo.GetTermTemplateByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modelo de termo não encontrado"})
		return
	}

	// Atualizar campos
	if req.Title != "" {
		template.Title = req.Title
	}
	if req.Content != "" {
		template.Content = req.Content
	}
	if req.Version != "" {
		template.Version = req.Version
	}

	// Se está ativando este modelo, desativar outros
	if req.IsActive != nil && *req.IsActive && !template.IsActive {
		if err := termRepo.DeactivateAllTemplates(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar modelos existentes"})
			return
		}
		template.IsActive = true
	} else if req.IsActive != nil {
		template.IsActive = *req.IsActive
	}

	template.UpdatedAt = time.Now()

	if err := termRepo.UpdateTermTemplate(template); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar modelo de termo"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// DeleteTermTemplate exclui um modelo de termo
func DeleteTermTemplate(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Verificar se o modelo existe
	template, err := termRepo.GetTermTemplateByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modelo de termo não encontrado"})
		return
	}

	// Verificar se há termos assinados usando este modelo
	hasSignedTerms, err := termRepo.HasSignedTermsForTemplate(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar termos assinados"})
		return
	}

	if hasSignedTerms {
		c.JSON(http.StatusConflict, gin.H{"error": "Não é possível excluir um modelo que possui termos assinados"})
		return
	}

	if err := termRepo.DeleteTermTemplate(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir modelo de termo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Modelo de termo excluído com sucesso"})
}

// SetTemplateActive define um modelo como ativo (e desativa os demais)
func SetTemplateActive(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Verificar se o modelo existe
	template, err := termRepo.GetTermTemplateByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modelo de termo não encontrado"})
		return
	}

	// Se já estiver ativo, não fazer nada
	if template.IsActive {
		c.JSON(http.StatusOK, gin.H{"message": "Este modelo já está ativo"})
		return
	}

	// Iniciar transação
	tx := db.Begin()

	// Desativar todos os modelos
	if err := tx.Model(&models.VolunteerTermTemplate{}).Update("is_active", false).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar modelos existentes"})
		return
	}

	// Ativar o modelo selecionado
	if err := tx.Model(&template).Update("is_active", true).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ativar modelo"})
		return
	}

	// Confirmar transação
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao confirmar transação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Modelo definido como ativo com sucesso"})
}

// ListVolunteerTerms lista todos os termos assinados (admin)
func ListVolunteerTerms(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	statusFilter := c.Query("status")

	terms, err := termRepo.GetAllVolunteerTerms(statusFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar termos"})
		return
	}

	c.JSON(http.StatusOK, terms)
}

// ListExpiringTerms lista termos próximos da expiração (admin)
func ListExpiringTerms(c *gin.Context) {
	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'days' inválido"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Calcular data limite
	limitDate := time.Now().AddDate(0, 0, days)

	terms, err := termRepo.GetExpiringTerms(limitDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar termos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"terms":      terms,
		"count":      len(terms),
		"limit_date": limitDate.Format("2006-01-02"),
	})
}

// GetVolunteerTermDetails obtém detalhes de um termo específico
func GetVolunteerTermDetails(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	term, err := termRepo.GetVolunteerTermByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Termo não encontrado"})
		return
	}

	// Registrar visualização no histórico (opcional)
	userIDVal, exists := c.Get("userID")
	if exists {
		userID := userIDVal.(uint)

		history := models.VolunteerTermHistory{
			TermID:     id,
			ActionType: "viewed",
			ActionDate: time.Now(),
			ActionByID: &userID,
			Details:    "Termo visualizado por administrador",
			CreatedBy:  userID,
		}

		db.Create(&history)
	}

	c.JSON(http.StatusOK, term)
}

// GetTeacherTerms obtém todos os termos de um professor específico
func GetTeacherTerms(c *gin.Context) {
	teacherIDStr := c.Param("id")
	teacherIDInt, err := strconv.Atoi(teacherIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de professor inválido"})
		return
	}
	teacherID := uint(teacherIDInt)

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)
	userRepo := repositories.NewUserRepository(db)

	// Verificar se o professor existe
	_, err = userRepo.FindByID(teacherID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Professor não encontrado"})
		return
	}

	terms, err := termRepo.GetVolunteerTermsByTeacherID(teacherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar termos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"terms": terms,
		"count": len(terms),
	})
}

// RevokeVolunteerTerm revoga um termo ativo
func RevokeVolunteerTerm(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	id := uint(idInt)

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "É necessário fornecer um motivo para a revogação"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Verificar se o termo existe
	term, err := termRepo.GetVolunteerTermByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Termo não encontrado"})
		return
	}

	// Verificar se o termo está ativo
	if term.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Apenas termos ativos podem ser revogados"})
		return
	}

	// Obter ID do usuário autenticado
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	// Iniciar transação
	tx := db.Begin()

	// Atualizar status do termo
	term.Status = "revoked"
	term.UpdatedAt = time.Now()

	if err := tx.Save(&term).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao revogar termo"})
		return
	}

	// Registrar ação no histórico
	history := models.VolunteerTermHistory{
		TermID:     id,
		ActionType: "revoked",
		ActionDate: time.Now(),
		ActionByID: &userID,
		Details:    "Termo revogado. Motivo: " + req.Reason,
		CreatedBy:  userID,
	}

	if err := tx.Create(&history).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar histórico"})
		return
	}

	// Confirmar transação
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao confirmar transação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Termo revogado com sucesso",
		"term":    term,
	})
}

// SendExpirationReminders envia lembretes para termos próximos da expiração
func SendExpirationReminders(c *gin.Context) {
	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'days' inválido"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)

	// Calcular data limite
	limitDate := time.Now().AddDate(0, 0, days)

	// Buscar termos que expiram em breve e não tiveram lembrete enviado
	terms, err := termRepo.GetExpiringTermsWithoutReminder(limitDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar termos"})
		return
	}

	if len(terms) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "Nenhum termo encontrado para envio de lembretes",
			"count":   0,
		})
		return
	}

	// Obter ID do usuário autenticado
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
		return
	}
	userID := userIDVal.(uint)

	// Contador de sucessos
	successCount := 0

	// Enviar lembretes
	for _, term := range terms {
		// Criar notificação
		notification := models.Notification{
			UserID:      term.TeacherID,
			Title:       "Termo de Voluntariado próximo da expiração",
			Content:     "Seu termo de voluntariado expira em " + term.ExpirationDate.Format("02/01/2006") + ". Por favor, entre em contato para renovação.",
			Type:        "volunteer_term",
			Channel:     "in-app", // Pode ser expandido para outros canais
			Status:      "pending",
			RelatedType: "volunteer_term",
			RelatedID:   &term.ID,
		}

		// Iniciar transação para cada termo
		tx := db.Begin()

		// Salvar notificação
		if err := notificationRepo.Create(&notification); err != nil {
			tx.Rollback()
			continue
		}

		// Marcar termo como tendo recebido lembrete
		term.ReminderSent = true
		if err := tx.Save(&term).Error; err != nil {
			tx.Rollback()
			continue
		}

		// Registrar ação no histórico
		history := models.VolunteerTermHistory{
			TermID:     term.ID,
			ActionType: "reminder_sent",
			ActionDate: time.Now(),
			ActionByID: &userID,
			Details:    "Lembrete de expiração enviado",
			CreatedBy:  userID,
		}

		if err := tx.Create(&history).Error; err != nil {
			tx.Rollback()
			continue
		}

		// Confirmar transação
		if err := tx.Commit().Error; err != nil {
			continue
		}

		successCount++
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Lembretes enviados com sucesso",
		"total":   len(terms),
		"success": successCount,
	})
}

// GetTermHistory obtém o histórico de um termo específico
func GetTermHistory(c *gin.Context) {
	termIDStr := c.Param("termId")
	termIDInt, err := strconv.Atoi(termIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de termo inválido"})
		return
	}
	termID := uint(termIDInt)

	db := c.MustGet("db").(*gorm.DB)
	termRepo := repositories.NewVolunteerTermRepository(db)

	// Verificar se o termo existe
	_, err = termRepo.GetVolunteerTermByID(termID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Termo não encontrado"})
		return
	}

	// Buscar histórico
	history, err := termRepo.GetTermHistory(termID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar histórico"})
		return
	}

	c.JSON(http.StatusOK, history)
}
