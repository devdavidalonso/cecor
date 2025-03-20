package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// GetCourses retorna todos os cursos
func GetCourses(repo *repositories.CourseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		courses, err := repo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, courses)
	}
}

// GetCourse retorna um curso pelo ID
func GetCourse(repo *repositories.CourseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		course, err := repo.FindByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Course not found",
			})
			return
		}

		c.JSON(http.StatusOK, course)
	}
}

// CreateCourse cria um novo curso
func CreateCourse(repo *repositories.CourseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var course models.Course
		if err := c.ShouldBindJSON(&course); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		course.CreatedAt = time.Now()
		// course.Active = true

		createdCourse, err := repo.Create(course)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, createdCourse)
	}
}

// UpdateCourse atualiza um curso
func UpdateCourse(repo *repositories.CourseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		var course models.Course
		if err := c.ShouldBindJSON(&course); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		course.ID = uint(id)
		updatedCourse, err := repo.Update(course)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, updatedCourse)
	}
}

// DeleteCourse desativa um curso
func DeleteCourse(repo *repositories.CourseRepository) gin.HandlerFunc {
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
			"message": "Course successfully deactivated",
		})
	}
}

// ListPublicCourses lista cursos públicos (sem necessidade de login)
func ListPublicCourses(courseRepo *repositories.CourseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		courses, err := courseRepo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
			return
		}

		// Filtrar apenas informações públicas dos cursos
		var publicCourses []map[string]interface{}
		for _, course := range courses {
			publicCourse := map[string]interface{}{
				"id":          course.ID,
				"name":        course.Name,
				"description": course.Description,
				"workload":    course.Workload,
				"week_days":   course.WeekDays,
				"start_time":  course.StartTime,
				"end_time":    course.EndTime,
				"duration":    course.Duration,
			}
			publicCourses = append(publicCourses, publicCourse)
		}

		c.JSON(http.StatusOK, publicCourses)
	}
}

// ListAvailableCourses lista cursos disponíveis para matrícula (para alunos logados)
func ListAvailableCourses(courseRepo *repositories.CourseRepository, enrollmentRepo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		// Obter todos os cursos
		courses, err := courseRepo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
			return
		}

		// Verificar matrículas do aluno
		enrollments, err := enrollmentRepo.FindByUserID(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar matrículas"})
			return
		}

		// Criar mapa de matrículas para consulta rápida
		enrolledCourses := make(map[uint]bool)
		for _, enrollment := range enrollments {
			if enrollment.Status == "ativa" || enrollment.Status == "active" {
				enrolledCourses[enrollment.CourseID] = true
			}
		}

		// Estrutura para retorno
		type CourseWithEnrollment struct {
			ID          uint   `json:"id"`
			Name        string `json:"name"`
			Description string `json:"description"`
			Workload    int    `json:"workload"`
			MaxStudents int    `json:"max_students"`
			WeekDays    string `json:"week_days"`
			StartTime   string `json:"start_time"`
			EndTime     string `json:"end_time"`
			Duration    int    `json:"duration"`
			IsEnrolled  bool   `json:"is_enrolled"`
		}

		// Compor o resultado final
		var result []CourseWithEnrollment
		for _, course := range courses {
			result = append(result, CourseWithEnrollment{
				ID:          course.ID,
				Name:        course.Name,
				Description: course.Description,
				Workload:    course.Workload,
				MaxStudents: course.MaxStudents,
				WeekDays:    course.WeekDays,
				StartTime:   course.StartTime,
				EndTime:     course.EndTime,
				Duration:    course.Duration,
				IsEnrolled:  enrolledCourses[course.ID],
			})
		}

		c.JSON(http.StatusOK, result)
	}
}

// ListAllCourses lista todos os cursos (admin)
func ListAllCourses(courseRepo *repositories.CourseRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		courses, err := courseRepo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
			return
		}

		c.JSON(http.StatusOK, courses)
	}
}

// GetCourseDetails retorna detalhes de um curso específico
func GetCourseDetails(courseRepo *repositories.CourseRepository, enrollmentRepo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		course, err := courseRepo.FindByID(id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
			return
		}

		// Adicionar informações adicionais, como número de alunos matriculados
		activeEnrollments, err := enrollmentRepo.CountActiveByCourseID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar matrículas"})
			return
		}

		// Estrutura para resposta
		response := struct {
			ID                uint   `json:"id"`
			Name              string `json:"name"`
			Description       string `json:"description"`
			Workload          int    `json:"workload"`
			MaxStudents       int    `json:"max_students"`
			WeekDays          string `json:"week_days"`
			StartTime         string `json:"start_time"`
			EndTime           string `json:"end_time"`
			Duration          int    `json:"duration"`
			CreatedAt         string `json:"created_at"`
			UpdatedAt         string `json:"updated_at"`
			ActiveEnrollments int    `json:"active_enrollments"`
			AvailableSpots    int    `json:"available_spots"`
		}{
			ID:                course.ID,
			Name:              course.Name,
			Description:       course.Description,
			Workload:          course.Workload,
			MaxStudents:       course.MaxStudents,
			WeekDays:          course.WeekDays,
			StartTime:         course.StartTime,
			EndTime:           course.EndTime,
			Duration:          course.Duration,
			CreatedAt:         course.CreatedAt.Format("2006-01-02"),
			UpdatedAt:         course.UpdatedAt.Format("2006-01-02"),
			ActiveEnrollments: activeEnrollments,
			AvailableSpots:    course.MaxStudents - activeEnrollments,
		}

		c.JSON(http.StatusOK, response)
	}
}

// DeleteCourse exclui (soft delete) um curso
func DeleteCourseEnrollment(courseRepo *repositories.CourseRepository, enrollmentRepo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		id := uint(idInt)

		// Verificar se existem matrículas ativas
		activeEnrollments, err := enrollmentRepo.CountActiveByCourseID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar matrículas"})
			return
		}

		if activeEnrollments > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Não é possível excluir cursos com matrículas ativas"})
			return
		}

		// Soft delete - usar o GORM para soft delete
		if err := courseRepo.Delete(id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir curso"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Curso excluído com sucesso"})
	}
}
