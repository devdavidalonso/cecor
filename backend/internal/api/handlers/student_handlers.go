package handlers

import (
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
func CreateStudent(repo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var student models.Student
		if err := c.ShouldBindJSON(&student); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		student.CreatedAt = time.Now()
		student.Active = true

		createdStudent, err := repo.Create(student)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, createdStudent)
	}
}

// UpdateStudent atualiza um aluno
func UpdateStudent(repo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		var student models.Student
		if err := c.ShouldBindJSON(&student); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		student.ID = id
		updatedStudent, err := repo.Update(student)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
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
