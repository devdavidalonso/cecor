package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/devdavidalonso/cecor/backend/internal/auth"
	"github.com/devdavidalonso/cecor/backend/pkg/errors"
)

// UserClaims armazena informações do usuário no contexto
type UserClaims struct {
	UserID int64    `json:"userId"`
	Name   string   `json:"name"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
}

// contextKey é um tipo para chaves de contexto
type contextKey string

// userClaimsKey é a chave para armazenar claims do usuário no contexto
const userClaimsKey contextKey = "userClaims"

// Authenticate verifica o token JWT de autenticação
func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extrair token do cabeçalho Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			errors.RespondWithError(w, http.StatusUnauthorized, "Token de autenticação não fornecido")
			return
		}

		// Verificar formato do token (Bearer token)
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			errors.RespondWithError(w, http.StatusUnauthorized, "Formato de token inválido")
			return
		}

		// Validar token
		claims, err := auth.ValidateToken(parts[1])
		if err != nil {
			errors.RespondWithError(w, http.StatusUnauthorized, fmt.Sprintf("Token inválido: %v", err))
			return
		}

		// Extrair claims específicas do usuário
		userClaims := &UserClaims{
			UserID: int64(claims["userId"].(float64)),
			Email:  claims["email"].(string),
			Name:   claims["name"].(string),
		}

		// Extrair roles (pode ser opcional em alguns tokens)
		if rolesInterface, ok := claims["roles"]; ok {
			if rolesArray, ok := rolesInterface.([]interface{}); ok {
				for _, role := range rolesArray {
					if roleStr, ok := role.(string); ok {
						userClaims.Roles = append(userClaims.Roles, roleStr)
					}
				}
			}
		}

		// Adicionar claims ao contexto
		ctx := context.WithValue(r.Context(), userClaimsKey, userClaims)

		// Chamar o próximo handler com o contexto atualizado
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAdmin verifica se o usuário tem papel de administrador
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Obter claims do contexto
		claims, ok := r.Context().Value(userClaimsKey).(*UserClaims)
		if !ok {
			errors.RespondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
			return
		}

		// Verificar se o usuário tem papel de administrador
		isAdmin := false
		for _, role := range claims.Roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}

		if !isAdmin {
			errors.RespondWithError(w, http.StatusForbidden, "Acesso negado: privilégios de administrador necessários")
			return
		}

		// Usuário tem permissão, prosseguir
		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext extrai informações do usuário do contexto
func GetUserFromContext(ctx context.Context) (*UserClaims, bool) {
	claims, ok := ctx.Value(userClaimsKey).(*UserClaims)
	return claims, ok
}
