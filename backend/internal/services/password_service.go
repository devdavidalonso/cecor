// internal/services/password_service.go
package services

import (
	"crypto/rand"
	"encoding/base64"
	"math/big"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword gera o hash da senha usando bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash verifica se a senha corresponde ao hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateRandomPassword gera uma senha aleatória com o tamanho especificado
func GenerateRandomPassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?"
	password := make([]byte, length)

	for i := range password {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		password[i] = charset[n.Int64()]
	}

	return string(password)
}

// GenerateToken gera um token aleatório para recuperação de senha ou validação de email
func GenerateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
