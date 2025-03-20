package handlers

import (
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// GetStudentAuditHistory obtém o histórico de alterações de um aluno
func GetStudentAuditHistory(repo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("id")
		studentIDInt, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de aluno inválido"})
			return
		}
		studentID := uint(studentIDInt)

		logs, err := repo.FindByEntityID("student", studentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar histórico de auditoria"})
			return
		}

		c.JSON(http.StatusOK, logs)
	}
}

// GetGuardianAuditHistory obtém o histórico de alterações de um responsável
func GetGuardianAuditHistory(repo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		guardianIDStr := c.Param("id")
		guardianIDInt, err := strconv.Atoi(guardianIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de responsável inválido"})
			return
		}
		guardianID := uint(guardianIDInt)

		logs, err := repo.FindByEntityID("guardian", guardianID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar histórico de auditoria"})
			return
		}

		c.JSON(http.StatusOK, logs)
	}
}

// GetSystemAuditLogs obtém logs de auditoria do sistema com filtros
func GetSystemAuditLogs(repo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parâmetros de filtro opcionais
		entityType := c.Query("entity_type")
		userIDStr := c.Query("user_id")
		actionType := c.Query("action")

		// Converter userID se fornecido
		var userID *uint
		if userIDStr != "" {
			userIDInt, err := strconv.Atoi(userIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuário inválido"})
				return
			}
			userIDUint := uint(userIDInt)
			userID = &userIDUint
		}

		// Buscar logs com filtros
		var userIDValue uint
		if userID != nil {
			userIDValue = *userID
		}
		logs, err := repo.FindWithFilters(entityType, userIDValue, actionType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar logs de auditoria"})
			return
		}

		c.JSON(http.StatusOK, logs)
	}
}
