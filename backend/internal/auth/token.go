package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/devdavidalonso/cecor/backend/internal/config"
)

// TokenType define o tipo de token JWT
type TokenType string

const (
	// AccessToken é usado para autenticação de APIs
	AccessToken TokenType = "access"
	// RefreshToken é usado para renovar o token de acesso
	RefreshToken TokenType = "refresh"
)

// GenerateToken gera um novo token JWT
func GenerateToken(userID int64, email, name string, roles []string, tokenType TokenType, cfg *config.Config) (string, error) {
	var secret string
	var expiry time.Duration

	// Definir secret e tempo de expiração com base no tipo de token
	if tokenType == AccessToken {
		secret = cfg.Auth.JwtSecret
		expiry = time.Duration(cfg.Auth.JwtExpiryHours) * time.Hour
	} else {
		secret = cfg.Auth.RefreshSecret
		expiry = time.Duration(cfg.Auth.RefreshExpiryHours) * time.Hour
	}

	// Criar claims
	claims := jwt.MapClaims{
		"userId": userID,
		"email":  email,
		"name":   name,
		"roles":  roles,
		"type":   string(tokenType),
		"exp":    time.Now().Add(expiry).Unix(),
		"iat":    time.Now().Unix(),
	}

	// Criar token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Assinar token
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("erro ao assinar token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken valida um token JWT e retorna seus claims
func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	// TODO: Obter segredo da configuração
	// Por ora, usando um segredo fixo
	secret := "sua_chave_secreta_muito_segura"

	// Analisar token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Verificar método de assinatura
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inválido: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("erro ao analisar token: %w", err)
	}

	// Verificar se o token é válido
	if !token.Valid {
		return nil, fmt.Errorf("token inválido")
	}

	// Extrair claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("claims inválidos no token")
	}

	return claims, nil
}

// RefreshAccessToken gera um novo token de acesso a partir de um token de atualização válido
func RefreshAccessToken(refreshToken string, cfg *config.Config) (string, error) {
	// Validar token de atualização
	claims, err := ValidateToken(refreshToken)
	if err != nil {
		return "", fmt.Errorf("token de atualização inválido: %w", err)
	}

	// Verificar se é um token de atualização
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != string(RefreshToken) {
		return "", fmt.Errorf("token não é um token de atualização")
	}

	// Extrair informações do usuário
	userID := int64(claims["userId"].(float64))
	email := claims["email"].(string)
	name := claims["name"].(string)

	// Extrair roles
	var roles []string
	if rolesInterface, ok := claims["roles"]; ok {
		if rolesArray, ok := rolesInterface.([]interface{}); ok {
			for _, role := range rolesArray {
				if roleStr, ok := role.(string); ok {
					roles = append(roles, roleStr)
				}
			}
		}
	}

	// Gerar novo token de acesso
	accessToken, err := GenerateToken(userID, email, name, roles, AccessToken, cfg)
	if err != nil {
		return "", fmt.Errorf("erro ao gerar novo token de acesso: %w", err)
	}

	return accessToken, nil
}
