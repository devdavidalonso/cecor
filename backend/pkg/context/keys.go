// backend/pkg/context/keys.go
package context

type contextKey string

// Chaves de contexto para valores compartilhados
const (
	LoggerKey    contextKey = "logger"
	UserKey      contextKey = "user"
	RequestIDKey contextKey = "requestID"
)
