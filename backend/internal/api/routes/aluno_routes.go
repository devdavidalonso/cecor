package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/devdavidalonso/cecor/backend/internal/api/handlers"
	"github.com/devdavidalonso/cecor/backend/internal/api/middleware"
)

// SetupAlunoRoutes configura as rotas para o recurso de alunos
func SetupAlunoRoutes(r chi.Router, handler *handlers.AlunoHandler) {
	// Rotas públicas
	r.Group(func(r chi.Router) {
		// Aqui podem ficar rotas públicas se necessário
	})

	// Rotas protegidas
	r.Group(func(r chi.Router) {
		r.Use(middleware.Authenticate)

		// Rotas de alunos
		r.Route("/alunos", func(r chi.Router) {
			r.Get("/", handler.GetAlunos)          // Listar alunos
			r.Post("/", handler.CreateAluno)       // Criar aluno
			r.Get("/{id}", handler.GetAluno)       // Buscar aluno por ID
			r.Put("/{id}", handler.UpdateAluno)    // Atualizar aluno
			r.Delete("/{id}", handler.DeleteAluno) // Excluir aluno

			// Sub-rotas para responsáveis
			r.Route("/{id}/responsaveis", func(r chi.Router) {
				r.Get("/", handler.GetResponsaveis) // Listar responsáveis
				r.Post("/", handler.AddResponsavel) // Adicionar responsável
			})

			// Sub-rotas para documentos
			r.Route("/{id}/documentos", func(r chi.Router) {
				r.Get("/", handler.GetDocumentos) // Listar documentos
				r.Post("/", handler.AddDocumento) // Adicionar documento
			})

			// Sub-rotas para notas
			r.Route("/{id}/notas", func(r chi.Router) {
				r.Get("/", handler.GetNotas) // Listar notas
				r.Post("/", handler.AddNota) // Adicionar nota
			})
		})

		// Rotas de responsáveis
		r.Route("/responsaveis", func(r chi.Router) {
			r.Put("/{id}", handler.UpdateResponsavel)    // Atualizar responsável
			r.Delete("/{id}", handler.DeleteResponsavel) // Excluir responsável
		})

		// Rotas de documentos
		r.Route("/documentos", func(r chi.Router) {
			r.Delete("/{id}", handler.DeleteDocumento) // Excluir documento
		})
	})
}
