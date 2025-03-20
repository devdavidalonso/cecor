package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UploadStudentDocument faz upload de um documento para um aluno
func UploadStudentDocument(
	documentRepo *repositories.DocumentRepository,
	studentRepo *repositories.StudentRepository,
) gin.HandlerFunc {
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

		// Obter o arquivo do formulário
		file, err := c.FormFile("document")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum arquivo enviado"})
			return
		}

		// Validar tipo de arquivo (opcional)
		extension := filepath.Ext(file.Filename)
		allowedExtensions := []string{".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
		validExtension := false
		for _, ext := range allowedExtensions {
			if extension == ext {
				validExtension = true
				break
			}
		}

		if !validExtension {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo de arquivo não permitido"})
			return
		}

		// Gerar nome único para o arquivo
		fileName := uuid.New().String() + extension
		filePath := fmt.Sprintf("uploads/documents/%s", fileName)

		// Salvar o arquivo no servidor
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
			return
		}

		// Obter nome do documento e tipo do formulário
		documentName := c.PostForm("name")
		documentType := c.PostForm("type")

		if documentName == "" {
			documentName = file.Filename
		}

		if documentType == "" {
			documentType = "other"
		}

		// Criar registro do documento
		userIDVal, exists := c.Get("userId")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		document := models.Document{
			StudentID:  studentID,
			Name:       documentName,
			Type:       documentType,
			Path:       filePath,
			UploadedBy: userID,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		if err := documentRepo.Create(&document); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar documento"})
			return
		}

		c.JSON(http.StatusCreated, document)
	}
}

// ListStudentDocuments lista todos os documentos de um aluno
func ListStudentDocuments(documentRepo *repositories.DocumentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("id")
		studentIDInt, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de aluno inválido"})
			return
		}
		studentID := uint(studentIDInt)

		documents, err := documentRepo.FindByStudentID(studentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar documentos"})
			return
		}

		c.JSON(http.StatusOK, documents)
	}
}

// GetStudentDocument obtém um documento específico
func GetStudentDocument(documentRepo *repositories.DocumentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		docIDStr := c.Param("docId")
		docIDInt, err := strconv.Atoi(docIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento inválido"})
			return
		}
		docID := uint(docIDInt)

		document, err := documentRepo.FindByID(docID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Documento não encontrado"})
			return
		}

		// Enviar o arquivo como download
		c.File(document.Path)
	}
}

// DeleteStudentDocument exclui um documento
func DeleteStudentDocument(documentRepo *repositories.DocumentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		docIDStr := c.Param("docId")
		docIDInt, err := strconv.Atoi(docIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento inválido"})
			return
		}
		docID := uint(docIDInt)

		_, err = documentRepo.FindByID(docID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Documento não encontrado"})
			return
		}

		// Excluir o registro do banco de dados
		if err := documentRepo.Delete(docID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir documento"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Documento excluído com sucesso"})
	}
}
