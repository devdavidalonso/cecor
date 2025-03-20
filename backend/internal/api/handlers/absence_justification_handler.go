package handlers

import (
	"net/http"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// JustifyAbsence submete justificativa para uma ausência
func JustifyAbsence(absenceJustificationrepo *repositories.AbsenceJustificationRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			StudentID   uint   `json:"student_id" binding:"required"`
			CourseID    uint   `json:"course_id" binding:"required"`
			StartDate   string `json:"start_date" binding:"required"`
			EndDate     string `json:"end_date" binding:"required"`
			Reason      string `json:"reason" binding:"required"`
			DocumentURL string `json:"document_url"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
			return
		}

		// Converter datas
		startDate, err := time.Parse("2006-01-02", request.StartDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inicial inválido. Use AAAA-MM-DD"})
			return
		}

		endDate, err := time.Parse("2006-01-02", request.EndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data final inválido. Use AAAA-MM-DD"})
			return
		}

		// Verificar validade das datas
		if endDate.Before(startDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data final não pode ser anterior à data inicial"})
			return
		}

		// Obter ID do usuário autenticado
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		// Criar justificativa
		justification := models.AbsenceJustification{
			StudentID:     request.StudentID,
			CourseID:      request.CourseID,
			StartDate:     startDate,
			EndDate:       endDate,
			Reason:        request.Reason,
			DocumentURL:   request.DocumentURL,
			Status:        "pending",
			SubmittedByID: userID,
		}

		if err := absenceJustificationrepo.CreateAbsenceJustification(justification); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar justificativa"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":       "Justificativa enviada com sucesso",
			"justification": justification,
		})
	}
}
