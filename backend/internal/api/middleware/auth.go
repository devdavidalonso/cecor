package middleware

import (
	"net/http"
)

// Auth é um middleware de autenticação simples
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Por enquanto apenas passa a requisição adiante
		// Implementação real de autenticação será adicionada depois
		next.ServeHTTP(w, r)
	})
}
