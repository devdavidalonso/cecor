// internal/api/handlers/course_handler.go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/pkg/database"
	"github.com/gin-gonic/gin"
)

// ListPublicCourses lista cursos públicos (sem necessidade de login)
func ListPublicCourses(c *gin.Context) {
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var courses []models.Course
	if err := db.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

// ListAvailableCourses lista cursos disponíveis para matrícula (para alunos logados)
func ListAvailableCourses(c *gin.Context) {
	userID := c.GetUint("userID")
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var courses []models.Course

	// Buscar cursos com informação se aluno já está matriculado
	type CourseWithEnrollment struct {
		models.Course
		IsEnrolled bool `json:"is_enrolled"`
	}

	var result []CourseWithEnrollment

	// Obter todos os cursos
	if err := db.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
		return
	}

	// Verificar matrículas do aluno
	var enrollments []models.Enrollment
	if err := db.Where("user_id = ? AND status = ?", userID, "ativa").Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar matrículas"})
		return
	}

	// Criar mapa de matrículas para consulta rápida
	enrolledCourses := make(map[uint]bool)
	for _, enrollment := range enrollments {
		enrolledCourses[enrollment.CourseID] = true
	}

	// Compor o resultado final
	for _, course := range courses {
		result = append(result, CourseWithEnrollment{
			Course:     course,
			IsEnrolled: enrolledCourses[course.ID],
		})
	}

	c.JSON(http.StatusOK, result)
}

// CreateCourse cria um novo curso (admin)
func CreateCourse(c *gin.Context) {
	var course models.Course

	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	course.CreatedAt = time.Now()
	course.UpdatedAt = time.Now()

	if err := db.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar curso", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, course)
}

// GetCourseDetails retorna detalhes de um curso (admin)
func GetCourseDetails(c *gin.Context) {
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

	var course models.Course
	if err := db.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
		return
	}

	c.JSON(http.StatusOK, course)
}

// UpdateCourse atualiza dados de um curso (admin)
func UpdateCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var courseUpdate models.Course
	if err := c.ShouldBindJSON(&courseUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var course models.Course
	if err := db.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
		return
	}

	// Atualizar campos
	courseUpdate.ID = uint(id)
	courseUpdate.UpdatedAt = time.Now()

	if err := db.Model(&course).Updates(courseUpdate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar curso"})
		return
	}

	// Buscar curso atualizado
	db.First(&course, id)
	c.JSON(http.StatusOK, course)
}

// DeleteCourse exclui um curso (admin)
func DeleteCourse(c *gin.Context) {
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

	// Verificar se existem matrículas ativas
	var count int64
	db.Model(&models.Enrollment{}).Where("course_id = ? AND status = ?", id, "ativa").Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Não é possível excluir cursos com matrículas ativas"})
		return
	}

	// Soft delete - apenas marcar como inativo ou definir deleted_at se estiver usando gorm.Model
	if err := db.Delete(&models.Course{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir curso"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Curso excluído com sucesso"})
}