package errors

import (
	"encoding/json"
	"log"
	"net/http"
)

// AppError representa um erro da aplicação
type AppError struct {
	StatusCode int    `json:"-"`
	Code       string `json:"code"`
	Message    string `json:"message"`
	Details    any    `json:"details,omitempty"`
}

// Error implementa a interface error
func (e AppError) Error() string {
	return e.Message
}

// NewAppError cria um novo erro da aplicação
func NewAppError(statusCode int, code, message string, details any) AppError {
	return AppError{
		StatusCode: statusCode,
		Code:       code,
		Message:    message,
		Details:    details,
	}
}

// NotFoundError cria um erro para recursos não encontrados
func NotFoundError(message string) AppError {
	return NewAppError(http.StatusNotFound, "NOT_FOUND", message, nil)
}

// BadRequestError cria um erro para requisições inválidas
func BadRequestError(message string) AppError {
	return NewAppError(http.StatusBadRequest, "BAD_REQUEST", message, nil)
}

// InternalServerError cria um erro para falhas internas
func InternalServerError(message string) AppError {
	return NewAppError(http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, nil)
}

// ValidationError cria um erro para validações
func ValidationError(details any) AppError {
	return NewAppError(http.StatusBadRequest, "VALIDATION_ERROR", "Erro de validação", details)
}

// UnauthorizedError cria um erro para autenticação
func UnauthorizedError(message string) AppError {
	return NewAppError(http.StatusUnauthorized, "UNAUTHORIZED", message, nil)
}

// ForbiddenError cria um erro para acesso negado
func ForbiddenError(message string) AppError {
	return NewAppError(http.StatusForbidden, "FORBIDDEN", message, nil)
}

// ConflictError cria um erro para conflitos
func ConflictError(message string) AppError {
	return NewAppError(http.StatusConflict, "CONFLICT", message, nil)
}

// RespondWithError envia uma resposta de erro formatada
func RespondWithError(w http.ResponseWriter, statusCode int, message string) {
	RespondWithErrorDetails(w, statusCode, message, nil)
}

// RespondWithErrorDetails envia uma resposta de erro com detalhes adicionais
func RespondWithErrorDetails(w http.ResponseWriter, statusCode int, message string, details any) {
	AppError := NewAppError(statusCode, http.StatusText(statusCode), message, details)
	RespondWithJSON(w, statusCode, AppError)
}

// RespondWithJSON envia uma resposta JSON
func RespondWithJSON(w http.ResponseWriter, statusCode int, payload any) {
	response, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Erro ao serializar resposta JSON: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(response)
}
