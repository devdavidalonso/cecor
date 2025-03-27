package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/devdavidalonso/cecor/backend/internal/api/middleware"
	"github.com/devdavidalonso/cecor/backend/internal/config"
)

// Register configura todas as rotas da API
func Register(r chi.Router, cfg *config.Config) {
	// Rota de saúde para verificação do servidor
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		// Rotas públicas (sem autenticação)
		r.Group(func(r chi.Router) {
			r.Post("/auth/login", http.NotFound)   // TODO: Implementar handler
			r.Post("/auth/refresh", http.NotFound) // TODO: Implementar handler
		})

		// Rotas protegidas (com autenticação)
		r.Group(func(r chi.Router) {
			// Aplicar middleware de autenticação
			r.Use(middleware.Authenticate)

			// Alunos
			r.Route("/alunos", func(r chi.Router) {
				r.Get("/", http.NotFound)        // TODO: Implementar handler
				r.Post("/", http.NotFound)       // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Cursos
			r.Route("/cursos", func(r chi.Router) {
				r.Get("/", http.NotFound)        // TODO: Implementar handler
				r.Post("/", http.NotFound)       // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Matrículas
			r.Route("/matriculas", func(r chi.Router) {
				r.Get("/", http.NotFound)        // TODO: Implementar handler
				r.Post("/", http.NotFound)       // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Presenças
			r.Route("/presencas", func(r chi.Router) {
				r.Get("/", http.NotFound)                            // TODO: Implementar handler
				r.Post("/", http.NotFound)                           // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)                        // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)                        // TODO: Implementar handler
				r.Get("/curso/{cursoId}/data/{data}", http.NotFound) // TODO: Implementar handler
			})

			// Notificações
			r.Route("/notificacoes", func(r chi.Router) {
				r.Get("/", http.NotFound)          // TODO: Implementar handler
				r.Post("/", http.NotFound)         // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)      // TODO: Implementar handler
				r.Put("/{id}/lida", http.NotFound) // TODO: Implementar handler
			})

			// Relatórios
			r.Route("/relatorios", func(r chi.Router) {
				r.Get("/frequencia/{cursoId}", http.NotFound) // TODO: Implementar handler
				r.Get("/alunos", http.NotFound)               // TODO: Implementar handler
				r.Get("/cursos", http.NotFound)               // TODO: Implementar handler
			})

			// Entrevistas
			r.Route("/entrevistas", func(r chi.Router) {
				r.Get("/", http.NotFound)     // TODO: Implementar handler
				r.Post("/", http.NotFound)    // TODO: Implementar handler
				r.Get("/{id}", http.NotFound) // TODO: Implementar handler
				r.Put("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Voluntariado
			r.Route("/voluntariado", func(r chi.Router) {
				r.Get("/termos", http.NotFound)               // TODO: Implementar handler
				r.Post("/termos", http.NotFound)              // TODO: Implementar handler
				r.Get("/termos/{id}", http.NotFound)          // TODO: Implementar handler
				r.Post("/termos/{id}/assinar", http.NotFound) // TODO: Implementar handler
			})

			// Usuários e Permissões (admin)
			r.Route("/usuarios", func(r chi.Router) {
				r.Use(middleware.RequireAdmin)
				r.Get("/", http.NotFound)        // TODO: Implementar handler
				r.Post("/", http.NotFound)       // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})
		})
	})
}
