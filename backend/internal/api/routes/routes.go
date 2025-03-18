// internal/api/routes/routes.go
package routes

import (
	"github.com/devdavidalonso/cecor/internal/api/handlers"
	"github.com/devdavidalonso/cecor/internal/api/middleware"
	"github.com/gin-gonic/gin"
)

// SetupRouter configura todas as rotas da API
func SetupRouter() *gin.Engine {
	router := gin.Default()
	
	// Middleware global para CORS
	router.Use(middleware.CORSMiddleware())
	
    // No seu arquivo de rotas do backend
    router.GET("/api/health", func(c *gin.Context) {
	    c.JSON(200, gin.H{"status": "ok"})
    })

	// Grupo de rotas públicas
	public := router.Group("/api")
	{
		// Rotas de autenticação
		public.POST("/login", handlers.Login)
		public.POST("/register", handlers.RegisterStudent)
		
		// Rotas públicas de cursos (se houver)
		public.GET("/courses/public", handlers.ListPublicCourses)
	}
	
	// Grupo de rotas para alunos (requer autenticação)
	student := router.Group("/api/student")
	student.Use(middleware.AuthMiddleware("aluno"))
	{
		student.GET("/profile", handlers.GetUserProfile)
		student.PUT("/profile", handlers.UpdateUserProfile)
		student.GET("/courses", handlers.ListAvailableCourses)
		student.POST("/enroll", handlers.EnrollInCourse)
		student.GET("/enrollments", handlers.GetStudentEnrollments)
	}
	
	// Grupo de rotas para administradores
	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware("admin"))
	{
		// Gestão de cursos
		admin.POST("/courses", handlers.CreateCourse)
		admin.GET("/courses", handlers.ListAllCourses)
		admin.GET("/courses/:id", handlers.GetCourseDetails)
		admin.PUT("/courses/:id", handlers.UpdateCourse)
		admin.DELETE("/courses/:id", handlers.DeleteCourse)
		
		// Gestão de usuários
		admin.GET("/users", handlers.ListAllUsers)
		admin.GET("/users/:id", handlers.GetUserDetails)
		admin.PUT("/users/:id", handlers.UpdateUser)
		admin.DELETE("/users/:id", handlers.DeleteUser)
		
		// Gestão de matrículas
		admin.GET("/enrollments", handlers.ListAllEnrollments)
		admin.PUT("/enrollments/:id", handlers.UpdateEnrollment)
		admin.DELETE("/enrollments/:id", handlers.DeleteEnrollment)
	}
	
	return router
}

// No arquivo internal/api/routes/routes.go, adicionar no grupo de rotas para professores

// Routes for teachers
teacher := router.Group("/api/teacher")
teacher.Use(middleware.AuthMiddleware("teacher"))
{
	// Attendance routes
	teacher.POST("/attendance/course/:id/date/:date", handlers.RegisterCourseAttendance)
	teacher.GET("/attendance/course/:id/date/:date", handlers.FindCourseAttendances)
	teacher.POST("/attendance/student", handlers.RegisterStudentAttendance)
	teacher.PUT("/attendance/:id", handlers.UpdateAttendance)
	
	// Justification routes
	teacher.GET("/justifications/pending", handlers.ListPendingJustifications)
	teacher.PUT("/justifications/:id", handlers.ReviewJustification)
	
	// Alert routes
	teacher.GET("/alerts/absences", handlers.ListAbsenceAlerts)
	teacher.PUT("/alerts/absences/:id/resolve", handlers.ResolveAbsenceAlert)
}

// No grupo de rotas para alunos, adicionar:
student.GET("/attendance/my", handlers.MyAttendances)
student.POST("/justifications", handlers.SubmitJustification)
student.GET("/justifications/my", handlers.MyJustifications)

// No arquivo internal/api/routes/routes.go

// Complementando o grupo de rotas para administradores
admin := router.Group("/api/admin")
admin.Use(middleware.AuthMiddleware("admin"))
{
	// ... rotas existentes ...
	
	// Rotas para gestão de formulários e entrevistas
	admin.GET("/forms", handlers.ListForms)
	admin.POST("/forms", handlers.CreateForm)
	admin.GET("/forms/:id", handlers.GetFormDetails)
	admin.PUT("/forms/:id", handlers.UpdateForm)
	admin.DELETE("/forms/:id", handlers.DeleteForm)
	
	admin.POST("/forms/:id/questions", handlers.AddFormQuestion)
	admin.PUT("/questions/:id", handlers.UpdateFormQuestion)
	admin.DELETE("/questions/:id", handlers.DeleteFormQuestion)
	
	admin.GET("/interviews", handlers.ListInterviews)
	admin.POST("/interviews", handlers.ScheduleInterview)
	admin.PUT("/interviews/:id", handlers.UpdateInterview)
	admin.POST("/interviews/:id/cancel", handlers.CancelInterview)
	admin.POST("/interviews/:id/complete", handlers.CompleteInterview)
	admin.POST("/interviews/:id/reschedule", handlers.RescheduleInterview)
	
	admin.GET("/form-responses", handlers.ListAllFormResponses)
	admin.GET("/form-responses/:id", handlers.GetFormResponseDetails)
	
	// Rotas para gestão de termos de voluntariado
	admin.GET("/volunteer-templates", handlers.ListTermTemplates)
	admin.POST("/volunteer-templates", handlers.CreateTermTemplate)
	admin.GET("/volunteer-templates/:id", handlers.GetTermTemplateDetails)
	admin.PUT("/volunteer-templates/:id", handlers.UpdateTermTemplate)
	admin.DELETE("/volunteer-templates/:id", handlers.DeleteTermTemplate)
	admin.PUT("/volunteer-templates/:id/active", handlers.SetTemplateActive)
	
	admin.GET("/volunteer-terms", handlers.ListVolunteerTerms)
	admin.GET("/volunteer-terms/expiring", handlers.ListExpiringTerms)
	admin.POST("/volunteer-terms/send-reminders", handlers.SendExpirationReminders)
	admin.GET("/volunteer-terms/:id", handlers.GetVolunteerTermDetails)
	admin.GET("/volunteer-terms/teacher/:id", handlers.GetTeacherTerms)
	admin.POST("/volunteer-terms/:id/revoke", handlers.RevokeVolunteerTerm)
	
	admin.GET("/term-history/:termId", handlers.GetTermHistory)
}

// Grupo de rotas para professores
teacher := router.Group("/api/teacher")
teacher.Use(middleware.AuthMiddleware("teacher"))
{
	// ... rotas existentes ...
	
	// Rotas para entrevistas (visualização apenas das próprias)
	teacher.GET("/interviews/my", handlers.GetMyInterviews)
	teacher.GET("/interviews/:id", handlers.GetInterviewDetails)
	
	// Rotas para responder formulários
	teacher.POST("/form-responses", handlers.SubmitFormResponse)
	teacher.GET("/form-responses/my", handlers.GetMyFormResponses)
	
	// Rotas para termos de voluntariado
	teacher.GET("/volunteer-terms/my", handlers.GetMyVolunteerTerms)
	teacher.GET("/volunteer-terms/current-template", handlers.GetCurrentTemplate)
	teacher.POST("/volunteer-terms/sign", handlers.SignVolunteerTerm)
}

// Rotas para alunos relacionadas a entrevistas
student := router.Group("/api/student")
student.Use(middleware.AuthMiddleware("aluno"))
{
	// ... rotas existentes ...
	
	// Rotas para entrevistas
	student.GET("/interviews/my", handlers.GetMyInterviews)
	student.GET("/interviews/:id", handlers.GetInterviewDetails)
	
	// Rotas para responder formulários
	student.POST("/form-responses", handlers.SubmitFormResponse)
	student.GET("/form-responses/my", handlers.GetMyFormResponses)
}