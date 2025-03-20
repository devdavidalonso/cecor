package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// AddStudentNote adiciona uma observação a um aluno (admin)
func AddStudentNote(noteRepo *repositories.NoteRepository, studentRepo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("id")
		studentIDInt, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de aluno inválido"})
			return
		}
		studentID := uint(studentIDInt)

		// Verificar se o aluno existe
		_, err = studentRepo.FindByID(studentID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Aluno não encontrado"})
			return
		}

		var input struct {
			Content        string `json:"content" binding:"required"`
			IsConfidential bool   `json:"is_confidential"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		note := models.StudentNote{
			StudentID:      studentID,
			AuthorID:       userID,
			Content:        input.Content,
			IsConfidential: input.IsConfidential,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		if err := noteRepo.Create(&note); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar observação"})
			return
		}

		c.JSON(http.StatusCreated, note)
	}
}

// GetStudentNotes obtém todas as observações de um aluno
func GetStudentNotes(noteRepo *repositories.NoteRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("id")
		studentIDInt, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de aluno inválido"})
			return
		}
		studentID := uint(studentIDInt)

		// Obter perfil do usuário para verificar permissões
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

		// Determinar se deve retornar todas as notas ou apenas as não confidenciais
		showAllNotes := userRole == "admin"

		notes, err := noteRepo.FindByStudentID(studentID, userID, showAllNotes)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar observações"})
			return
		}

		c.JSON(http.StatusOK, notes)
	}
}

// UpdateStudentNote atualiza uma observação
func UpdateStudentNote(noteRepo *repositories.NoteRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		noteIDStr := c.Param("noteId")
		noteIDInt, err := strconv.Atoi(noteIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de observação inválido"})
			return
		}
		noteID := uint(noteIDInt)

		// Verificar se a observação existe
		note, err := noteRepo.FindByID(noteID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Observação não encontrada"})
			return
		}

		// Verificar permissões
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

		if note.AuthorID != userID && userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sem permissão para editar esta observação"})
			return
		}

		var input struct {
			Content        string `json:"content"`
			IsConfidential *bool  `json:"is_confidential"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Atualizar dados da observação
		if input.Content != "" {
			note.Content = input.Content
		}

		// Apenas admins podem alterar a confidencialidade
		if input.IsConfidential != nil && userRole == "admin" {
			note.IsConfidential = *input.IsConfidential
		}

		note.UpdatedAt = time.Now()

		if err := noteRepo.Update(note); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar observação"})
			return
		}

		c.JSON(http.StatusOK, note)
	}
}

// DeleteStudentNote exclui uma observação
func DeleteStudentNote(noteRepo *repositories.NoteRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		noteIDStr := c.Param("noteId")
		noteIDInt, err := strconv.Atoi(noteIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de observação inválido"})
			return
		}
		noteID := uint(noteIDInt)

		// Verificar se a observação existe
		note, err := noteRepo.FindByID(noteID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Observação não encontrada"})
			return
		}

		// Verificar permissões
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

		if note.AuthorID != userID && userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sem permissão para excluir esta observação"})
			return
		}

		if err := noteRepo.Delete(noteID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir observação"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Observação excluída com sucesso"})
	}
}
