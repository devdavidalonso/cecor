package middleware

import (
	"net/http"
	"strings"

	"github.com/devdavidalonso/cecor/pkg/auth"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware verifica a autenticação do usuário e o perfil requerido
func AuthMiddleware(requiredProfile string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obter o token do cabeçalho Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Autenticação necessária"})
			c.Abort()
			return
		}

		// Verificar formato "Bearer {token}"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
			c.Abort()
			return
		}

		// Validar o token
		tokenString := parts[1]
		_, claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: " + err.Error()})
			c.Abort()
			return
		}

		// Verificar perfil do usuário, se necessário
		if requiredProfile != "" {
			// Admin tem acesso a tudo, outros perfis precisam corresponder ao exigido
			if claims.Profile != "admin" && claims.Profile != requiredProfile {
				c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Perfil requerido: " + requiredProfile})
				c.Abort()
				return
			}
		}

		// Armazenar informações do usuário no contexto
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userProfile", claims.Profile)

		c.Next()
	}
}

// CORSMiddleware permite solicitações de origens diferentes (cross-origin)
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}