package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// GetStudents retorna todos os alunos
func GetStudents(repo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		students, err := repo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, students)
	}
}

// GetStudent retorna um aluno pelo ID
func GetStudent(repo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		student, err := repo.FindByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Student not found",
			})
			return
		}

		c.JSON(http.StatusOK, student)
	}
}

// CreateStudent cria um novo aluno
func CreateStudent(repo *repositories.StudentRepository, auditRepo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// Apenas administradores podem criar alunos
		if userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sem permissão para criar alunos"})
			return
		}

		var student models.Student
		if err := c.ShouldBindJSON(&student); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Dados inválidos",
				"details": err.Error(),
			})
			return
		}

		student.CreatedAt = time.Now()
		student.UpdatedAt = time.Now()

		// Criar o aluno - note que o método Create retorna apenas um erro
		if _, err := repo.Create(&student); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Erro ao criar aluno",
				"details": err.Error(),
			})
			return
		}

		// Registrar auditoria
		auditLog := models.AuditLog{
			EntityType: "student",
			EntityID:   student.ID,
			Action:     "create",
			UserID:     userID,
			CreatedAt:  time.Now(),
		}

		if err := auditRepo.Create(&auditLog); err != nil {
			// Apenas logar o erro, não interromper o fluxo
			fmt.Printf("Erro ao registrar auditoria: %v\n", err)
		}
		c.JSON(http.StatusCreated, student)
	}
}

// UpdateStudent atualiza um aluno
func UpdateStudent(repo *repositories.StudentRepository, auditRepo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// Apenas administradores podem atualizar alunos
		if userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sem permissão para atualizar alunos"})
			return
		}

		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "ID de aluno inválido",
			})
			return
		}
		id := uint(idInt)

		// Verificar se o aluno existe
		existingStudent, err := repo.FindByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Aluno não encontrado",
			})
			return
		}

		// Estrutura para receber os dados da atualização
		var updateData struct {
			RegistrationNumber string `json:"registration_number"`
			Status             string `json:"status"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Dados inválidos",
				"details": err.Error(),
			})
			return
		}

		// Guardar dados antigos para auditoria
		oldData, err := json.Marshal(existingStudent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao preparar dados para auditoria",
			})
			return
		}

		// Atualizar dados do aluno
		if updateData.RegistrationNumber != "" {
			existingStudent.RegistrationNumber = updateData.RegistrationNumber
		}
		if updateData.Status != "" {
			existingStudent.Status = updateData.Status
		}

		existingStudent.UpdatedAt = time.Now()

		// Atualizar o aluno - note que o método Update retorna apenas um erro
		_, err = repo.Update(existingStudent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Erro ao atualizar aluno",
				"details": err.Error(),
			})
			return
		}

		// Buscar o aluno atualizado para retornar na resposta
		updatedStudent, err := repo.FindByID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao recuperar aluno atualizado",
			})
			return
		}

		// Dados novos para auditoria
		newData, err := json.Marshal(updatedStudent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erro ao preparar dados atualizados para auditoria",
			})
			return
		}

		// Registrar auditoria
		auditLog := models.AuditLog{
			EntityType: "student",
			EntityID:   id,
			Action:     "update",
			UserID:     userID,
			OldData:    string(oldData),
			NewData:    string(newData),
			CreatedAt:  time.Now(),
		}

		err = auditRepo.Create(&auditLog)
		if err != nil {
			// Apenas logar o erro, não interromper o fluxo
			fmt.Printf("Erro ao registrar auditoria: %v\n", err)
		}

		c.JSON(http.StatusOK, updatedStudent)
	}
}

// DeleteStudent desativa um aluno
func DeleteStudent(repo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		if err := repo.Delete(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Student successfully deactivated",
		})
	}
}
