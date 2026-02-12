package routes

import (
	"net/http"

	"github.com/devdavidalonso/cecor/backend/internal/api/handlers"
	"github.com/devdavidalonso/cecor/backend/internal/api/middleware"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/go-chi/chi/v5"
)

// Register configura todas as rotas da API
func Register(r chi.Router, cfg *config.Config, authHandler *handlers.AuthHandler, courseHandler *handlers.CourseHandler, enrollmentHandler *handlers.EnrollmentHandler, attendanceHandler *handlers.AttendanceHandler, reportHandler *handlers.ReportHandler) {
	// Rota de saúde para verificação do servidor
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		// Rotas públicas (sem autenticação)
		r.Group(func(r chi.Router) {
			r.Get("/auth/sso/login", authHandler.SSOLogin)       // Iniciar login SSO
			r.Get("/auth/sso/callback", authHandler.SSOCallback) // Callback do SSO
			r.Post("/auth/refresh", authHandler.RefreshToken)    // Handler implementado
		})

		// Rotas protegidas (com autenticação)
		r.Group(func(r chi.Router) {
			// Aplicar middleware de autenticação
			r.Use(middleware.Authenticate(cfg))

			// Endpoint de verificação de token
			r.Get("/auth/verify", authHandler.Verify)

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
				r.Get("/", courseHandler.ListCourses)
				r.Post("/", courseHandler.CreateCourse)
				r.Get("/{id}", courseHandler.GetCourse)
				r.Put("/{id}", courseHandler.UpdateCourse)
				r.Delete("/{id}", courseHandler.DeleteCourse)
			})

			// Matrículas
			r.Route("/matriculas", func(r chi.Router) {
				r.Get("/", enrollmentHandler.ListEnrollments)
				r.Post("/", enrollmentHandler.EnrollStudent)
				r.Get("/{id}", enrollmentHandler.GetEnrollment)
				r.Put("/{id}", enrollmentHandler.UpdateEnrollment)
				r.Delete("/{id}", enrollmentHandler.DeleteEnrollment)
			})

			// Presenças
			r.Route("/presencas", func(r chi.Router) {
				r.Post("/registrar", attendanceHandler.RecordBatch)
				r.Get("/curso/{id}/data/{data}", attendanceHandler.GetClassAttendance)
				r.Get("/aluno/{id}", attendanceHandler.GetStudentHistory)
				r.Get("/aluno/{id}/percentual", attendanceHandler.GetStudentPercentage)
			})

			// Notificações
			r.Route("/notificacoes", func(r chi.Router) {
				r.Get("/", http.NotFound)          // TODO: Implementar handler
				r.Post("/", http.NotFound)         // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)      // TODO: Implementar handler
				r.Put("/{id}/lida", http.NotFound) // TODO: Implementar handler
			})

			// Reports
			r.Route("/relatorios", func(r chi.Router) {
				r.Get("/frequencia/curso/{id}", reportHandler.GetCourseAttendanceReport)
				r.Get("/frequencia/aluno/{id}", reportHandler.GetStudentAttendanceReport)
				r.Get("/alunos", http.NotFound) // TODO: Implementar handler
				r.Get("/cursos", http.NotFound) // TODO: Implementar handler
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
				r.Get("/", http.NotFound)  // TODO: Implementar handler
				r.Post("/", http.NotFound) // TODO: Implementar handler
				r.Get("/professores", courseHandler.ListProfessors)
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})
		})
	})
}
