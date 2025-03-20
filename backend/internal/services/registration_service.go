// internal/services/registration_service.go
package services

import (
	"fmt"
	"math/rand"
	"time"
)

// GenerateRegistrationNumber gera um número de matrícula único no formato ANO+SEQUENCIAL+VERIFICADOR
func GenerateRegistrationNumber() string {
	// Obter o ano atual
	year := time.Now().Year()

	// Gerar número sequencial de 4 dígitos
	rand.Seed(time.Now().UnixNano())
	sequential := rand.Intn(9000) + 1000 // Número entre 1000 e 9999

	// Gerar dígito verificador simples (soma dos dígitos do número sequencial módulo 10)
	digits := sequential
	sum := 0
	for digits > 0 {
		sum += digits % 10
		digits /= 10
	}
	verifier := sum % 10

	// Formatar o número de matrícula: ANO + SEQUENCIAL + VERIFICADOR
	return fmt.Sprintf("%d%04d%d", year, sequential, verifier)
}

// ValidateRegistrationNumber verifica se um número de matrícula é válido
func ValidateRegistrationNumber(regNumber string) bool {
	if len(regNumber) != 9 { // 4 (ano) + 4 (sequencial) + 1 (verificador)
		return false
	}

	// Extrair as partes do número
	year := regNumber[0:4]
	sequential := regNumber[4:8]
	verifier := regNumber[8:9]

	// Validar o ano (deve ser um ano razoável, por exemplo, entre 2000 e o ano atual + 1)
	currentYear := time.Now().Year()
	var yearInt int
	fmt.Sscanf(year, "%d", &yearInt)
	if yearInt < 2000 || yearInt > currentYear+1 {
		return false
	}

	// Calcular o dígito verificador esperado
	var seqInt int
	fmt.Sscanf(sequential, "%d", &seqInt)

	sum := 0
	digits := seqInt
	for digits > 0 {
		sum += digits % 10
		digits /= 10
	}
	expectedVerifier := sum % 10

	var actualVerifier int
	fmt.Sscanf(verifier, "%d", &actualVerifier)

	return expectedVerifier == actualVerifier
}
