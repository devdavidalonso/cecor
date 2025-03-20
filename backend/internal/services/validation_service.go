// internal/services/validation_service.go
package services

import (
	"regexp"
	"strconv"
	"strings"
)

// ValidateCPF verifica se um CPF é válido
func ValidateCPF(cpf string) bool {
	// Remover caracteres não numéricos
	re := regexp.MustCompile(`\D`)
	cpf = re.ReplaceAllString(cpf, "")

	// CPF deve ter 11 dígitos
	if len(cpf) != 11 {
		return false
	}

	// Verificar se todos os dígitos são iguais (caso inválido)
	allEqual := true
	for i := 1; i < len(cpf); i++ {
		if cpf[i] != cpf[0] {
			allEqual = false
			break
		}
	}
	if allEqual {
		return false
	}

	// Calcular o primeiro dígito verificador
	sum := 0
	for i := 0; i < 9; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (10 - i)
	}
	remainder := sum % 11
	if remainder < 2 {
		if cpf[9] != '0' {
			return false
		}
	} else {
		checkDigit := 11 - remainder
		if cpf[9] != byte('0'+checkDigit) {
			return false
		}
	}

	// Calcular o segundo dígito verificador
	sum = 0
	for i := 0; i < 10; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (11 - i)
	}
	remainder = sum % 11
	if remainder < 2 {
		if cpf[10] != '0' {
			return false
		}
	} else {
		checkDigit := 11 - remainder
		if cpf[10] != byte('0'+checkDigit) {
			return false
		}
	}

	return true
}

// ValidateEmail verifica se um email parece válido
func ValidateEmail(email string) bool {
	// Expressão regular para validação básica de email
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

// ValidatePhone verifica se um telefone parece válido (formato brasileiro)
func ValidatePhone(phone string) bool {
	// Remover caracteres não numéricos
	re := regexp.MustCompile(`\D`)
	phone = re.ReplaceAllString(phone, "")

	// Verificar comprimento (8 a 11 dígitos)
	return len(phone) >= 8 && len(phone) <= 11
}

// FormatCPF formata um CPF no padrão XXX.XXX.XXX-XX
func FormatCPF(cpf string) string {
	// Remover caracteres não numéricos
	re := regexp.MustCompile(`\D`)
	cpf = re.ReplaceAllString(cpf, "")

	// Se não tiver 11 dígitos, retornar sem formatação
	if len(cpf) != 11 {
		return cpf
	}

	return cpf[0:3] + "." + cpf[3:6] + "." + cpf[6:9] + "-" + cpf[9:11]
}

// FormatPhone formata um telefone brasileiro
func FormatPhone(phone string) string {
	// Remover caracteres não numéricos
	re := regexp.MustCompile(`\D`)
	phone = re.ReplaceAllString(phone, "")

	// Formatar de acordo com o número de dígitos
	switch len(phone) {
	case 8: // Telefone fixo sem DDD
		return phone[0:4] + "-" + phone[4:8]
	case 9: // Celular sem DDD
		return phone[0:5] + "-" + phone[5:9]
	case 10: // Telefone fixo com DDD
		return "(" + phone[0:2] + ") " + phone[2:6] + "-" + phone[6:10]
	case 11: // Celular com DDD
		return "(" + phone[0:2] + ") " + phone[2:7] + "-" + phone[7:11]
	default:
		return phone
	}
}

// SanitizeName padroniza nomes (capitaliza palavras, remove espaços extras, etc.)
func SanitizeName(name string) string {
	// Remover espaços extras
	name = strings.TrimSpace(name)
	name = regexp.MustCompile(`\s+`).ReplaceAllString(name, " ")

	// Capitalizar primeira letra de cada palavra
	words := strings.Split(name, " ")
	for i, word := range words {
		if len(word) == 0 {
			continue
		}

		// Não capitalizar preposições e artigos
		lowercaseWords := map[string]bool{
			"de": true, "da": true, "do": true, "dos": true, "das": true,
			"e": true, "em": true, "por": true, "para": true, "com": true,
		}

		if lowercaseWords[strings.ToLower(word)] && i > 0 {
			words[i] = strings.ToLower(word)
		} else {
			words[i] = strings.ToUpper(word[0:1]) + strings.ToLower(word[1:])
		}
	}

	return strings.Join(words, " ")
}
