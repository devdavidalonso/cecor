package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// GetEnrollments retorna todas as matrículas
func GetEnrollments(repo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		enrollments, err := repo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, enrollments)
	}
}

// GetEnrollment retorna uma matrícula pelo ID
func GetEnrollment(repo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		enrollment, err := repo.FindByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Enrollment not found",
			})
			return
		}

		c.JSON(http.StatusOK, enrollment)
	}
}

// CreateEnrollment cria uma nova matrícula
func CreateEnrollment(
	enrollRepo *repositories.EnrollmentRepository,
	studentRepo *repositories.StudentRepository,
	courseRepo *repositories.CourseRepository,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		var enrollment models.Enrollment
		if err := c.ShouldBindJSON(&enrollment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Verificar se aluno existe
		_, err := studentRepo.FindByID(enrollment.UserID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Student not found"})
			return
		}

		// Verificar se curso existe
		_, err = courseRepo.FindByID(enrollment.CourseID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Course not found"})
			return
		}

		// Verificar se já existe matrícula
		exists, err := enrollRepo.ExistsByStudentAndCourse(enrollment.UserID, enrollment.CourseID)
		if err != nil || exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Student already enrolled in this course"})
			return
		}

		// Continuar com a criação...
		enrollment.CreatedAt = time.Now()

		createdEnrollment, err := enrollRepo.Create(enrollment)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, createdEnrollment)
	}
}

// UpdateEnrollment atualiza uma matrícula
func UpdateEnrollment(repo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		var enrollment models.Enrollment
		if err := c.ShouldBindJSON(&enrollment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		enrollment.ID = uint(id)
		updatedEnrollment, err := repo.Update(enrollment)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, updatedEnrollment)
	}
}

// DeleteEnrollment desativa uma matrícula
func DeleteEnrollment(repo *repositories.EnrollmentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		if err := repo.SoftDelete(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Enrollment successfully soft deleted",
		})
	}
}
