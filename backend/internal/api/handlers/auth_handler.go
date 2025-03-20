package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/devdavidalonso/cecor/pkg/auth"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Login autentica um usuário e retorna um token JWT
func Login(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var credentials struct {
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&credentials); err != nil {
			log.Printf("Erro de binding JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
			return
		}

		// No início da função Login
		log.Printf("Tentativa de login: %s", credentials.Email)

		// Buscar usuário
		user, err := userRepo.FindByEmail(credentials.Email)
		if err != nil || !user.Active {
			log.Printf("Usuário não encontrado ou inativo: %s, erro: %v", credentials.Email, err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
			return
		}

		log.Printf("Usuário encontrado, verificando senha para: %s", credentials.Email)

		// Verificar senha
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
			log.Printf("Senha incorreta para o usuário: %s", credentials.Email)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
			return
		}

		log.Printf("Senha correta, gerando token para: %s", credentials.Email)

		// Gerar token JWT
		token, err := auth.GenerateToken(user)
		if err != nil {
			log.Printf("Erro ao gerar token: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
			return
		}

		log.Printf("Login bem-sucedido para: %s", credentials.Email)

		// Retornar token e dados básicos do usuário
		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user": gin.H{
				"id":      user.ID,
				"name":    user.Name,
				"email":   user.Email,
				"profile": user.Profile,
			},
		})
	}
}

// RegisterStudent registra um novo aluno
func RegisterStudent(userRepo *repositories.UserRepository, studentRepo *repositories.StudentRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Name     string `json:"name" binding:"required"`
			Email    string `json:"email" binding:"required,email"`
			Password string `json:"password" binding:"required"`
			// Outros campos do usuário e aluno
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			log.Printf("Erro de binding JSON no registro: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
			return
		}

		log.Printf("Tentativa de registro para o email: %s", input.Email)

		// Verificar se e-mail já existe
		exists, _ := userRepo.ExistsByEmail(input.Email)
		if exists {
			log.Printf("Email já cadastrado: %s", input.Email)
			c.JSON(http.StatusConflict, gin.H{"error": "E-mail já cadastrado"})
			return
		}

		// Criptografar senha
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Erro ao gerar hash da senha: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
			return
		}

		// Criar o usuário
		user := models.User{
			Name:      input.Name,
			Email:     input.Email,
			Password:  string(hashedPassword),
			Profile:   "student",
			Active:    true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Salvar usuário
		createdUser, err := userRepo.Create(user)
		if err != nil {
			log.Printf("Erro ao salvar usuário: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar usuário", "details": err.Error()})
			return
		}

		// Criar o registro de aluno
		student := models.Student{
			UserID: createdUser.ID,
			// Active: true,
			// Adicionar outros campos conforme necessário
		}

		// Salvar aluno
		err = studentRepo.Create(&student)
		if err != nil {
			log.Printf("Erro ao salvar aluno: %v", err)
			// Desfazer criação do usuário em caso de erro
			userRepo.Delete(createdUser.ID)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar aluno", "details": err.Error()})
			return
		}

		log.Printf("Usuário registrado com sucesso: %s", input.Email)

		// Remover senha antes de retornar
		createdUser.Password = ""

		c.JSON(http.StatusCreated, gin.H{
			"message": "Usuário registrado com sucesso",
			"user":    createdUser,
		})
	}
}
