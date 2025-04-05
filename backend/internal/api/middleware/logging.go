// backend/internal/api/middleware/logging.go
package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/auth"
	myctx "github.com/devdavidalonso/cecor/backend/pkg/context"
	"github.com/devdavidalonso/cecor/backend/pkg/logger"
	"github.com/go-chi/chi/v5/middleware"
)

// UserClaims is assumed to be defined elsewhere, likely from your auth middleware
// If not imported, you need to define it here

// Logger adds a logger to the request context and logs request information
func Logger(log logger.Logger) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Add logger to context
			ctx := logger.WithContext(r.Context(), log)

			// Cria um ResponseWriter wrapper para capturar o status code
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			// Processa a requisição com o contexto atualizado
			next.ServeHTTP(ww, r.WithContext(ctx))

			// Log após a requisição
			duration := time.Since(start)

			// Extrair ID de usuário do contexto, se disponível
			userID := "anônimo"
			// If userClaimsKey is not defined elsewhere, make sure to either:
			// 1. Import it from the correct package
			// 2. Define it in this file or a keys.go file
			if user, ok := r.Context().Value(myctx.UserKey).(*auth.UserClaims); ok {
				userID = fmt.Sprintf("%d", user.UserID)
			}

			// Log estruturado da requisição
			log.Info("HTTP Request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"duration_ms", duration.Milliseconds(),
				"user_id", userID,
				"remote_addr", r.RemoteAddr,
				"user_agent", r.UserAgent(),
				"request_id", middleware.GetReqID(ctx),
			)
		})
	}
}
