package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/golang-jwt/jwt/v4"
)

type JWTClaims struct {
	UserID   uint   `json:"id"`
	Email    string `json:"email"`
	Profile  string `json:"profile"`
	jwt.RegisteredClaims
}

// GenerateToken gera um token JWT para o usuário
func GenerateToken(user models.User) (string, error) {
	// Obter chave secreta
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "chave_secreta_jwt_para_desenvolvimento" // Apenas para desenvolvimento!
	}

	// Definir período de expiração
	expirationTime := time.Now().Add(24 * time.Hour) // Token válido por 24 horas

	// Criar claims personalizados
	claims := &JWTClaims{
		UserID:  user.ID,
		Email:   user.Email,
		Profile: user.Profile,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "cecor-api",
		},
	}

	// Criar token com claims e método de assinatura
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Assinar o token com a chave secreta
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken valida um token JWT
func ValidateToken(tokenString string) (*jwt.Token, *JWTClaims, error) {
	// Obter chave secreta
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "chave_secreta_jwt_para_desenvolvimento" // Apenas para desenvolvimento!
	}

	// Definir uma variável para armazenar os claims
	claims := &JWTClaims{}

	// Validar o token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validar o método de assinatura
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, nil, err
	}

	if !token.Valid {
		return nil, nil, errors.New("token inválido")
	}

	return token, claims, nil
}