package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/pkg/auth"
	"github.com/devdavidalonso/cecor/pkg/database"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Login autentica um usuário e retorna um token JWT
func Login(c *gin.Context) {
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

	// Conectar ao banco
	db, err := database.GetDB()
	if err != nil {
		log.Printf("Erro de conexão com banco de dados: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	// Buscar usuário
	var user models.User
	if err := db.Where("email = ? AND active = ?", credentials.Email, true).First(&user).Error; err != nil {
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

// RegisterStudent registra um novo aluno
func RegisterStudent(c *gin.Context) {
	var newUser models.User

	if err := c.ShouldBindJSON(&newUser); err != nil {
		log.Printf("Erro de binding JSON no registro: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	log.Printf("Tentativa de registro para o email: %s", newUser.Email)

	db, err := database.GetDB()
	if err != nil {
		log.Printf("Erro de conexão com banco de dados: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao conectar ao banco de dados"})
		return
	}

	// Verificar se e-mail já existe
	var count int64
	db.Model(&models.User{}).Where("email = ?", newUser.Email).Count(&count)
	if count > 0 {
		log.Printf("Email já cadastrado: %s", newUser.Email)
		c.JSON(http.StatusConflict, gin.H{"error": "E-mail já cadastrado"})
		return
	}

	// Criptografar senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Erro ao gerar hash da senha: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
		return
	}
	newUser.Password = string(hashedPassword)

	// Definir perfil como aluno
	newUser.Profile = "aluno"
	newUser.Active = true
	newUser.CreatedAt = time.Now()
	newUser.UpdatedAt = time.Now()

	// Salvar no banco
	if err := db.Create(&newUser).Error; err != nil {
		log.Printf("Erro ao salvar usuário: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar usuário", "details": err.Error()})
		return
	}

	log.Printf("Usuário registrado com sucesso: %s", newUser.Email)

	// Remover senha antes de retornar
	newUser.Password = ""

	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuário registrado com sucesso",
		"user":    newUser,
	})
}