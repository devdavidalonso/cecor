package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/golang-jwt/jwt/v4"
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
func ValidateToken(tokenString string, cfg *config.Config) (jwt.MapClaims, error) {
	secret := cfg.Auth.JwtSecret

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

// ValidateSSOToken valida um token JWT do provedor SSO e retorna seus claims
func ValidateSSOToken(ctx context.Context, tokenString string) (map[string]interface{}, error) {
	if Provider == nil {
		return nil, fmt.Errorf("OIDC provider not initialized")
	}

	// Configurar verifier
	// Nota: Para tokens de acesso do Keycloak, pode ser necessário pular verificação de ClientID ou Issuer se não baterem exatamente.
	// Mas o padrão é verificar.
	verifier := Provider.Verifier(&oidc.Config{
		ClientID:          "ceco-frontend", // O mesmo ID usado no frontend
		SkipClientIDCheck: true,            // Descomente se necessário
		SkipIssuerCheck:   true,
	})

	// Verificar token
	idToken, err := verifier.Verify(ctx, tokenString)
	if err != nil {
		return nil, fmt.Errorf("falha na verificação do token OIDC: %w", err)
	}

	// Extrair claims
	var claims map[string]interface{}
	if err := idToken.Claims(&claims); err != nil {
		return nil, fmt.Errorf("falha ao extrair claims: %w", err)
	}

	return claims, nil
}

// RefreshAccessToken gera um novo token de acesso a partir de um token de atualização válido
func RefreshAccessToken(refreshToken string, cfg *config.Config) (string, error) {
	// Validar token de atualização
	claims, err := ValidateToken(refreshToken, cfg)
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

// GenerateTokens gera tokens de acesso e atualização para um usuário
func GenerateTokens(user *models.User, cfg *config.Config) (string, string, error) {
	// TODO: Obter roles reais do usuário
	roles := []string{}

	accessToken, err := GenerateToken(int64(user.ID), user.Email, user.Name, roles, AccessToken, cfg)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := GenerateToken(int64(user.ID), user.Email, user.Name, roles, RefreshToken, cfg)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
