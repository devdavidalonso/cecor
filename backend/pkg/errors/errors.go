package errors

import (
	"encoding/json"
	"log"
	"net/http"
)

// AppError represents an application error
type AppError struct {
	StatusCode int    `json:"-"`
	Code       string `json:"code"`
	Message    string `json:"message"`
	Details    any    `json:"details,omitempty"`
}

// Error implements the error interface
func (e AppError) Error() string {
	return e.Message
}

// NewAppError creates a new application error
func NewAppError(statusCode int, code, message string, details any) AppError {
	return AppError{
		StatusCode: statusCode,
		Code:       code,
		Message:    message,
		Details:    details,
	}
}

// NotFoundError creates an error for resources not found
func NotFoundError(message string) AppError {
	return NewAppError(http.StatusNotFound, "NOT_FOUND", message, nil)
}

// BadRequestError creates an error for invalid requests
func BadRequestError(message string) AppError {
	return NewAppError(http.StatusBadRequest, "BAD_REQUEST", message, nil)
}

// InternalServerError creates an error for internal failures
func InternalServerError(message string) AppError {
	return NewAppError(http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, nil)
}

// ValidationError creates an error for validations
func ValidationError(details any) AppError {
	return NewAppError(http.StatusBadRequest, "VALIDATION_ERROR", "Erro de validação", details)
}

// UnauthorizedError creates an error for authentication
func UnauthorizedError(message string) AppError {
	return NewAppError(http.StatusUnauthorized, "UNAUTHORIZED", message, nil)
}

// ForbiddenError creates an error for access denied
func ForbiddenError(message string) AppError {
	return NewAppError(http.StatusForbidden, "FORBIDDEN", message, nil)
}

// ConflictError creates an error for conflicts
func ConflictError(message string) AppError {
	return NewAppError(http.StatusConflict, "CONFLICT", message, nil)
}

// RespondWithError sends a formatted error response and logs the error
// Added request parameter to access context
func RespondWithError(w http.ResponseWriter, statusCode int, message string) {
	// // Get logger from request context
	// var log logger.Logger
	// if r != nil {
	// 	// Try to get logger from context
	// 	logger, ok := r.Context().Value(myctx.LoggerKey).(logger.Logger)
	// 	if ok {
	// 		log = logger
	// 	} else {
	// 		// Fallback to a new logger if not found in context
	// 		log = logger.DefaultLogger()
	// 	}

	// 	// Log the error with request details
	// 	log.Error("API Error",
	// 		"status_code", statusCode,
	// 		"error", message,
	// 		"path", r.URL.Path,
	// 		"method", r.Method,
	// 	)
	// } else {
	// 	// Create a new logger if request is nil (shouldn't happen in normal use)
	// 	log = logger.NewLogger()
	// 	log.Error("API Error (no request context)",
	// 		"status_code", statusCode,
	// 		"error", message,
	// 	)
	// }

	// Send the error response
	RespondWithErrorDetails(w, statusCode, message, nil)
}

// RespondWithErrorDetails sends an error response with additional details
func RespondWithErrorDetails(w http.ResponseWriter, statusCode int, message string, details any) {
	appError := NewAppError(statusCode, http.StatusText(statusCode), message, details)
	RespondWithJSON(w, statusCode, appError)
}

// RespondWithJSON sends a JSON response
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
