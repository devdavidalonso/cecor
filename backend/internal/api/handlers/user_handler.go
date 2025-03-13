// internal/api/handlers/user_handler.go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/pkg/database"
	"github.com/gin-gonic/gin"
)

// GetUserProfile retorna os dados do perfil do usuário logado
func GetUserProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Não retorna a senha
	user.Password = ""

	c.JSON(http.StatusOK, user)
}

// UpdateUserProfile atualiza os dados do perfil do usuário logado
func UpdateUserProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	
	var userUpdate models.User
	if err := c.ShouldBindJSON(&userUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Campos que um usuário comum pode atualizar
	updates := map[string]interface{}{
		"name":       userUpdate.Name,
		"phone":      userUpdate.Phone,
		"address":    userUpdate.Address,
		"updated_at": time.Now(),
	}

	if err := db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar usuário"})
		return
	}

	// Buscar usuário atualizado
	db.Where("id = ?", userID).First(&user)
	
	// Não retorna a senha
	user.Password = ""

	c.JSON(http.StatusOK, user)
}

// ListAllUsers lista todos os usuários (admin)
func ListAllUsers(c *gin.Context) {
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários"})
		return
	}

	// Não retorna as senhas
	for i := range users {
		users[i].Password = ""
	}

	c.JSON(http.StatusOK, users)
}

// GetUserDetails retorna detalhes de um usuário específico (admin)
func GetUserDetails(c *gin.Context) {
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

	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Não retorna a senha
	user.Password = ""

	c.JSON(http.StatusOK, user)
}

// UpdateUser atualiza dados de um usuário (admin)
func UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var userUpdate models.User
	if err := c.ShouldBindJSON(&userUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Definir campos que podem ser atualizados
	updates := map[string]interface{}{
		"name":       userUpdate.Name,
		"email":      userUpdate.Email,
		"profile":    userUpdate.Profile,
		"cpf":        userUpdate.CPF,
		"birth_date": userUpdate.BirthDate,
		"phone":      userUpdate.Phone,
		"address":    userUpdate.Address,
		"photo_url":  userUpdate.PhotoURL,
		"active":     userUpdate.Active,
		"updated_at": time.Now(),
	}

	if err := db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar usuário"})
		return
	}

	// Buscar usuário atualizado
	db.First(&user, id)
	
	// Não retorna a senha
	user.Password = ""

	c.JSON(http.StatusOK, user)
}

// DeleteUser desativa um usuário (soft delete) (admin)
func DeleteUser(c *gin.Context) {
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

	// Verificar se é o único admin
	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	if user.Profile == "admin" {
		var adminCount int64
		db.Model(&models.User{}).Where("profile = ? AND id != ?", "admin", id).Count(&adminCount)
		
		if adminCount == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Não é possível excluir o único administrador"})
			return
		}
	}

	// Soft delete - atualizando o campo active para false
	if err := db.Model(&models.User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"active":     false,
		"updated_at": time.Now(),
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar usuário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário desativado com sucesso"})
}

// ListAllCourses lista todos os cursos (admin)
func ListAllCourses(c *gin.Context) {
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