package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// GetGuardians retorna todos os responsáveis
func GetGuardians(repo *repositories.GuardianRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		guardians, err := repo.FindAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, guardians)
	}
}

// GetGuardian retorna um responsável pelo ID
func GetGuardian(repo *repositories.GuardianRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		guardian, err := repo.FindByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Guardian not found",
			})
			return
		}

		c.JSON(http.StatusOK, guardian)
	}
}

// CreateGuardian cria um novo responsável
func CreateGuardian(repo *repositories.GuardianRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var guardian models.Guardian
		if err := c.ShouldBindJSON(&guardian); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		guardian.CreatedAt = time.Now()

		createdGuardian, err := repo.Create(&guardian)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, createdGuardian)
	}
}

// UpdateGuardian atualiza um responsável
func UpdateGuardian(repo *repositories.GuardianRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID",
			})
			return
		}

		var guardian models.Guardian
		if err := c.ShouldBindJSON(&guardian); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		guardian.ID = uint(id)
		updatedGuardian, err := repo.Update(guardian)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, updatedGuardian)
	}
}

// DeleteGuardian remove um responsável
func DeleteGuardian(repo *repositories.GuardianRepository) gin.HandlerFunc {
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
			"message": "Guardian successfully removed",
		})
	}
}
