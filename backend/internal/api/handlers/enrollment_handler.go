// internal/api/handlers/enrollment_handler.go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/pkg/database"
	"github.com/gin-gonic/gin"
)

// EnrollInCourse matricula um aluno em um curso
func EnrollInCourse(c *gin.Context) {
	userID := c.GetUint("userID")
	
	var enrollmentData struct {
		CourseID uint `json:"course_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&enrollmentData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	// Verificar se o curso existe
	var course models.Course
	if err := db.First(&course, enrollmentData.CourseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
		return
	}

	// Verificar se já existe matrícula ativa
	var count int64
	db.Model(&models.Enrollment{}).Where(
		"user_id = ? AND course_id = ? AND status = ?", 
		userID, enrollmentData.CourseID, "ativa",
	).Count(&count)
	
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Você já está matriculado neste curso"})
		return
	}

	// Verificar número de vagas disponíveis
	db.Model(&models.Enrollment{}).Where(
		"course_id = ? AND status = ?", 
		enrollmentData.CourseID, "ativa",
	).Count(&count)
	
	if int(count) >= course.MaxStudents {
		c.JSON(http.StatusConflict, gin.H{"error": "Não há vagas disponíveis neste curso"})
		return
	}

	// Criar nova matrícula
	enrollment := models.Enrollment{
		UserID:    userID,
		CourseID:  enrollmentData.CourseID,
		Status:    "ativa",
		StartDate: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar matrícula"})
		return
	}

	// Carregar relações para retorno
	db.Preload("Course").First(&enrollment, enrollment.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Matrícula realizada com sucesso",
		"enrollment": enrollment,
	})
}

// GetStudentEnrollments lista todas as matrículas do aluno logado
func GetStudentEnrollments(c *gin.Context) {
	userID := c.GetUint("userID")
	
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var enrollments []models.Enrollment
	if err := db.Preload("Course").Where("user_id = ?", userID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar matrículas"})
		return
	}

	c.JSON(http.StatusOK, enrollments)
}

// ListAllEnrollments lista todas as matrículas (admin)
func ListAllEnrollments(c *gin.Context) {
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var enrollments []models.Enrollment
	if err := db.Preload("User").Preload("Course").Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar matrículas"})
		return
	}

	c.JSON(http.StatusOK, enrollments)
}

// UpdateEnrollment atualiza status de uma matrícula (admin)
func UpdateEnrollment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var enrollmentUpdate struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&enrollmentUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Validar status
	validStatus := map[string]bool{
		"ativa":     true,
		"concluida": true,
		"cancelada": true,
	}

	if !validStatus[enrollmentUpdate.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido"})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var enrollment models.Enrollment
	if err := db.First(&enrollment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Matrícula não encontrada"})
		return
	}

	// Atualizar status
	updates := map[string]interface{}{
		"status":     enrollmentUpdate.Status,
		"updated_at": time.Now(),
	}

	// Se o status for concluído, definir data de término
	if enrollmentUpdate.Status == "concluida" {
		updates["end_date"] = time.Now()
	}

	if err := db.Model(&enrollment).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar matrícula"})
		return
	}

	// Buscar matrícula atualizada
	db.Preload("User").Preload("Course").First(&enrollment, id)
	c.JSON(http.StatusOK, enrollment)
}

// DeleteEnrollment cancela uma matrícula (admin)
func DeleteEnrollment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	// Soft delete - alterar status para cancelada
	updates := map[string]interface{}{
		"status":     "cancelada",
		"updated_at": time.Now(),
		"end_date":   time.Now(),
	}

	if err := db.Model(&models.Enrollment{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao cancelar matrícula"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Matrícula cancelada com sucesso"})
}