package routes

import (
	"net/http"

	"github.com/devdavidalonso/cecor/backend/internal/api/handlers"
	"github.com/devdavidalonso/cecor/backend/internal/api/middleware"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/go-chi/chi/v5"
)

// Register configura todas as rotas da API
func Register(r chi.Router, cfg *config.Config, authHandler *handlers.AuthHandler, courseHandler *handlers.CourseHandler, enrollmentHandler *handlers.EnrollmentHandler, attendanceHandler *handlers.AttendanceHandler, reportHandler *handlers.ReportHandler, teacherHandler *handlers.TeacherHandler) {
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

			// Students
			r.Route("/students", func(r chi.Router) {
				r.Get("/", http.NotFound)        // TODO: Implementar handler
				r.Post("/", http.NotFound)       // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Courses
			r.Route("/courses", func(r chi.Router) {
				r.Get("/", courseHandler.ListCourses)
				r.Post("/", courseHandler.CreateCourse)
				r.Get("/{id}", courseHandler.GetCourse)
				r.Put("/{id}", courseHandler.UpdateCourse)
				r.Delete("/{id}", courseHandler.DeleteCourse)
			})

			// Enrollments
			r.Route("/enrollments", func(r chi.Router) {
				r.Get("/", enrollmentHandler.ListEnrollments)
				r.Post("/", enrollmentHandler.EnrollStudent)
				r.Get("/{id}", enrollmentHandler.GetEnrollment)
				r.Put("/{id}", enrollmentHandler.UpdateEnrollment)
				r.Delete("/{id}", enrollmentHandler.DeleteEnrollment)
			})

			// Attendance
			r.Route("/attendance", func(r chi.Router) {
				r.Post("/record", attendanceHandler.RecordBatch)
				r.Get("/course/{id}/date/{date}", attendanceHandler.GetClassAttendance)   // Changed data to date
				r.Get("/student/{id}", attendanceHandler.GetStudentHistory)               // Changed aluno to student
				r.Get("/student/{id}/percentage", attendanceHandler.GetStudentPercentage) // Changed percentual to percentage
			})

			// Notifications
			r.Route("/notifications", func(r chi.Router) {
				r.Get("/", http.NotFound)          // TODO: Implementar handler
				r.Post("/", http.NotFound)         // TODO: Implementar handler
				r.Get("/{id}", http.NotFound)      // TODO: Implementar handler
				r.Put("/{id}/read", http.NotFound) // TODO: Implementar handler
			})

			// Reports
			r.Route("/reports", func(r chi.Router) {
				r.Get("/attendance/course/{id}", reportHandler.GetCourseAttendanceReport)   // frequencia -> attendance
				r.Get("/attendance/student/{id}", reportHandler.GetStudentAttendanceReport) // frequencia -> attendance
				r.Get("/students", http.NotFound)                                           // TODO: Implementar handler
				r.Get("/courses", http.NotFound)                                            // TODO: Implementar handler
			})

			// Interviews
			r.Route("/interviews", func(r chi.Router) {
				r.Get("/", http.NotFound)     // TODO: Implementar handler
				r.Post("/", http.NotFound)    // TODO: Implementar handler
				r.Get("/{id}", http.NotFound) // TODO: Implementar handler
				r.Put("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Volunteering
			r.Route("/volunteering", func(r chi.Router) {
				r.Get("/terms", http.NotFound)            // TODO: Implementar handler
				r.Post("/terms", http.NotFound)           // TODO: Implementar handler
				r.Get("/terms/{id}", http.NotFound)       // TODO: Implementar handler
				r.Post("/terms/{id}/sign", http.NotFound) // TODO: Implementar handler
			})

			// Users & Permissions (admin)
			r.Route("/users", func(r chi.Router) {
				r.Use(middleware.RequireAdmin)
				r.Get("/", http.NotFound)  // TODO: Implementar handler
				r.Post("/", http.NotFound) // TODO: Implementar handler
				r.Get("/teachers", courseHandler.ListProfessors)
				r.Get("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Put("/{id}", http.NotFound)    // TODO: Implementar handler
				r.Delete("/{id}", http.NotFound) // TODO: Implementar handler
			})

			// Teachers
			r.Route("/teachers", func(r chi.Router) {
				// r.Use(middleware.RequireAdmin) // Idealmente restrito a admins
				r.Post("/", teacherHandler.CreateProfessor)
				r.Get("/", teacherHandler.GetProfessors)
				r.Get("/{id}", teacherHandler.GetProfessorByID)
				r.Put("/{id}", teacherHandler.UpdateProfessor)
				r.Delete("/{id}", teacherHandler.DeleteProfessor)
			})
		})
	})
}
