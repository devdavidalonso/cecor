// internal/api/routes/routes.go
package routes

import (
	"github.com/devdavidalonso/cecor/internal/api/handlers"
	"github.com/devdavidalonso/cecor/internal/api/middleware"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRouter configura todas as rotas da API
func SetupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	// Middleware global para CORS
	router.Use(middleware.CORSMiddleware())

	// Inicializar repositórios
	studentRepo := repositories.NewStudentRepository(db)
	courseRepo := repositories.NewCourseRepository(db)
	enrollmentRepo := repositories.NewEnrollmentRepository(db)
	userRepo := repositories.NewUserRepository(db)
	guardianRepo := repositories.NewGuardianRepository(db)
	auditRepo := repositories.NewAuditRepository(db)
	attendanceRepo := repositories.NewAttendanceRepository(db)
	documentRepo := repositories.NewDocumentRepository(db)
	noteRepo := repositories.NewNoteRepository(db)
	formRepo := repositories.NewFormRepository(db)
	formResponseRepo := repositories.NewFormResponseRepository(db)
	volunteerTermRepo := repositories.NewVolunteerTermRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)

	// No seu arquivo de rotas do backend
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Grupo de rotas públicas
	public := router.Group("/api")
	{
		// Rotas de autenticação
		public.POST("/login", handlers.Login(userRepo))
		public.POST("/register", handlers.RegisterStudent(userRepo, studentRepo))

		// Rotas públicas de cursos (se houver)
		public.GET("/courses/public", handlers.ListPublicCourses(courseRepo))
	}

	// Grupo de rotas para alunos (requer autenticação)
	student := router.Group("/api/student")
	student.Use(middleware.AuthMiddleware("aluno"))
	{
		student.GET("/profile", handlers.GetUserProfile(userRepo))
		student.PUT("/profile", handlers.UpdateUserProfile(userRepo))
		student.GET("/courses", handlers.ListAvailableCourses(courseRepo, enrollmentRepo))
		student.POST("/enroll", handlers.EnrollInCourse(enrollmentRepo, courseRepo))
		student.GET("/enrollments", handlers.GetStudentEnrollments(enrollmentRepo))

		// Registro de faltas e justificativas
		student.GET("/attendance/my", handlers.MyAttendances(attendanceRepo))
		student.POST("/justifications", handlers.SubmitJustification(attendanceRepo))
		student.GET("/justifications/my", handlers.MyJustifications(attendanceRepo))

		// Rotas para entrevistas
		student.GET("/interviews/my", handlers.GetMyInterviews(formRepo))
		student.GET("/interviews/:id", handlers.GetInterviewDetails(formRepo))

		// Rotas para responder formulários
		student.POST("/form-responses", handlers.SubmitFormResponse(formRepo, formResponseRepo))
		student.GET("/form-responses/my", handlers.GetMyFormResponses(formResponseRepo))
	}

	// Grupo de rotas para professores
	teacher := router.Group("/api/teacher")
	teacher.Use(middleware.AuthMiddleware("teacher"))
	{
		// Rotas de registro de presenças
		teacher.POST("/attendance/course/:id/date/:date", handlers.RegisterCourseAttendance(attendanceRepo))
		teacher.GET("/attendance/course/:id/date/:date", handlers.GetCourseAttendance(attendanceRepo))
		teacher.POST("/attendance/student", handlers.RegisterStudentAttendance(attendanceRepo))
		teacher.PUT("/attendance/:id", handlers.UpdateAttendance(attendanceRepo))

		// Rotas de justificativas
		teacher.GET("/justifications/pending", handlers.ListPendingJustifications(attendanceRepo))
		teacher.PUT("/justifications/:id", handlers.ReviewJustification(attendanceRepo))

		// Rotas de alertas
		teacher.GET("/alerts/absences", handlers.ListAbsenceAlerts(attendanceRepo))
		teacher.PUT("/alerts/absences/:id/resolve", handlers.ResolveAbsenceAlert(attendanceRepo))

		// Rotas para entrevistas (visualização apenas das próprias)
		teacher.GET("/interviews/my", handlers.GetMyInterviews(formRepo))
		teacher.GET("/interviews/:id", handlers.GetInterviewDetails(formRepo))

		// Rotas para responder formulários
		teacher.POST("/form-responses", handlers.SubmitFormResponse(formRepo, formResponseRepo))
		teacher.GET("/form-responses/my", handlers.GetMyFormResponses(formResponseRepo))

		// Rotas para termos de voluntariado
		teacher.GET("/volunteer-terms/my", handlers.GetMyVolunteerTerms(volunteerTermRepo))
		teacher.GET("/volunteer-terms/current-template", handlers.GetCurrentTemplate(volunteerTermRepo))
		teacher.POST("/volunteer-terms/sign", handlers.SignVolunteerTerm(volunteerTermRepo))

		// Rotas para gestão de alunos (acesso limitado para professores)
		teacher.GET("/students/course/:courseId", handlers.ListCourseStudents(studentRepo))
		teacher.GET("/students/:id", handlers.GetStudentBasicDetails(studentRepo))
		teacher.POST("/students/:id/notes", handlers.AddTeacherStudentNote(noteRepo, studentRepo))
		teacher.GET("/students/:id/notes", handlers.GetTeacherStudentNotes(noteRepo))
		teacher.PUT("/students/notes/:noteId", handlers.UpdateTeacherStudentNote(noteRepo))
	}

	// Grupo de rotas para gestores
	manager := router.Group("/api/manager")
	manager.Use(middleware.AuthMiddleware("gestor"))
	{
		// Gestão de alunos para gestores
		manager.GET("/students", handlers.ListAllStudents(studentRepo))
		manager.GET("/students/:id", handlers.GetStudentDetails(studentRepo))
		manager.POST("/students", handlers.CreateStudent(studentRepo, userRepo, auditRepo, guardianRepo))
		manager.PUT("/students/:id", handlers.UpdateStudent(studentRepo, userRepo, auditRepo))

		// Gestão de responsáveis
		manager.GET("/students/:id/guardians", handlers.ListStudentGuardians(guardianRepo))
		manager.POST("/students/:id/guardians", handlers.AddGuardian(guardianRepo, studentRepo, auditRepo))
		manager.PUT("/guardians/:id", handlers.UpdateGuardian(guardianRepo, auditRepo))

		// Busca e exportação
		manager.POST("/students/search", handlers.SearchStudents(studentRepo))
		manager.POST("/students/export", handlers.ExportStudentResults(studentRepo))

		// Adicionar outras rotas conforme necessário para gestores
	}

	// Grupo de rotas para administradores
	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware("admin"))
	{
		// Gestão de cursos
		admin.POST("/courses", handlers.CreateCourse(courseRepo))
		admin.GET("/courses", handlers.ListAllCourses(courseRepo))
		admin.GET("/courses/:id", handlers.GetCourseDetails(courseRepo, enrollmentRepo))
		admin.PUT("/courses/:id", handlers.UpdateCourse(courseRepo))
		admin.DELETE("/courses/:id", handlers.DeleteCourseEnrollment(courseRepo, enrollmentRepo))

		// Gestão de usuários
		admin.GET("/users", handlers.ListAllUsers(userRepo))
		admin.GET("/users/:id", handlers.GetUserDetails(userRepo))
		admin.PUT("/users/:id", handlers.UpdateUser(userRepo, auditRepo))
		admin.DELETE("/users/:id", handlers.DeleteUser(userRepo, auditRepo))

		// Gestão de matrículas
		admin.GET("/enrollments", handlers.ListAllEnrollments(enrollmentRepo))
		admin.PUT("/enrollments/:id", handlers.UpdateEnrollment(enrollmentRepo))
		admin.DELETE("/enrollments/:id", handlers.DeleteEnrollment(enrollmentRepo))

		// Rotas para gestão de formulários e entrevistas
		admin.GET("/forms", handlers.ListForms(formRepo))
		admin.POST("/forms", handlers.CreateForm(formRepo))
		admin.GET("/forms/:id", handlers.GetFormDetails(formRepo))
		admin.PUT("/forms/:id", handlers.UpdateForm(formRepo))
		admin.DELETE("/forms/:id", handlers.DeleteForm(formRepo, formResponseRepo))

		admin.POST("/forms/:id/questions", handlers.AddFormQuestion(formRepo))
		admin.PUT("/questions/:id", handlers.UpdateFormQuestion(formRepo))
		admin.DELETE("/questions/:id", handlers.DeleteFormQuestion(formRepo, formResponseRepo))

		admin.GET("/interviews", handlers.ListInterviews(formRepo))
		admin.POST("/interviews", handlers.ScheduleInterview(formRepo))
		admin.PUT("/interviews/:id", handlers.UpdateInterview(formRepo))
		admin.POST("/interviews/:id/cancel", handlers.CancelInterview(formRepo))
		admin.POST("/interviews/:id/complete", handlers.CompleteInterview(formRepo))
		admin.POST("/interviews/:id/reschedule", handlers.RescheduleInterview(formRepo))

		admin.GET("/form-responses", handlers.ListAllFormResponses(formResponseRepo))
		admin.GET("/form-responses/:id", handlers.GetFormResponseDetails(formResponseRepo))

		// Rotas para gestão de termos de voluntariado
		admin.GET("/volunteer-templates", handlers.ListTermTemplates(volunteerTermRepo))
		admin.POST("/volunteer-templates", handlers.CreateTermTemplate(volunteerTermRepo))
		admin.GET("/volunteer-templates/:id", handlers.GetTermTemplateDetails(volunteerTermRepo))
		admin.PUT("/volunteer-templates/:id", handlers.UpdateTermTemplate(volunteerTermRepo))
		admin.DELETE("/volunteer-templates/:id", handlers.DeleteTermTemplate(volunteerTermRepo))
		admin.PUT("/volunteer-templates/:id/active", handlers.SetTemplateActive(volunteerTermRepo))

		admin.GET("/volunteer-terms", handlers.ListVolunteerTerms(volunteerTermRepo))
		admin.GET("/volunteer-terms/expiring", handlers.ListExpiringTerms(volunteerTermRepo))
		admin.POST("/volunteer-terms/send-reminders", handlers.SendExpirationReminders(volunteerTermRepo, notificationRepo))
		admin.GET("/volunteer-terms/:id", handlers.GetVolunteerTermDetails(volunteerTermRepo))
		admin.GET("/volunteer-terms/teacher/:id", handlers.GetTeacherTerms(volunteerTermRepo, userRepo))
		admin.POST("/volunteer-terms/:id/revoke", handlers.RevokeVolunteerTerm(volunteerTermRepo))

		admin.GET("/term-history/:termId", handlers.GetTermHistory(volunteerTermRepo))

		// NOVIDADES: Gestão completa de alunos conforme seção 3.1 do documento técnico

		// Rotas para gestão completa de alunos
		admin.GET("/students", handlers.ListAllStudents(studentRepo))
		admin.GET("/students/:id", handlers.GetStudentDetails(studentRepo))
		admin.POST("/students", handlers.CreateStudent(studentRepo, userRepo, auditRepo, guardianRepo))
		admin.PUT("/students/:id", handlers.UpdateStudent(studentRepo, userRepo, auditRepo))
		admin.DELETE("/students/:id", handlers.DeleteStudent(studentRepo, userRepo, auditRepo)) // Soft delete

		// Busca avançada de alunos com múltiplos critérios
		admin.POST("/students/search", handlers.SearchStudents(studentRepo))

		// Exportação de resultados da busca
		admin.POST("/students/export", handlers.ExportStudentResults(studentRepo))

		// Rotas para gestão de responsáveis
		admin.GET("/students/:id/guardians", handlers.ListStudentGuardians(guardianRepo))
		admin.POST("/students/:id/guardians", handlers.AddGuardian(guardianRepo, studentRepo, auditRepo))
		admin.GET("/guardians/:id", handlers.GetGuardian(guardianRepo))
		admin.PUT("/guardians/:id", handlers.UpdateGuardian(guardianRepo, auditRepo))
		admin.DELETE("/guardians/:id", handlers.DeleteGuardian(guardianRepo)) // Soft delete

		// Upload de documentos
		admin.POST("/students/:id/documents", handlers.UploadStudentDocument(documentRepo, studentRepo))
		admin.GET("/students/:id/documents", handlers.ListStudentDocuments(documentRepo))
		admin.GET("/students/documents/:docId", handlers.GetStudentDocument(documentRepo))
		admin.DELETE("/students/documents/:docId", handlers.DeleteStudentDocument(documentRepo))

		// Histórico de alterações
		admin.GET("/students/:id/history", handlers.GetStudentAuditHistory(auditRepo))
		admin.GET("/guardians/:id/history", handlers.GetGuardianAuditHistory(auditRepo))

		// Observações confidenciais
		admin.POST("/students/:id/notes", handlers.AddStudentNote(noteRepo, studentRepo))
		admin.GET("/students/:id/notes", handlers.GetStudentNotes(noteRepo))
		admin.PUT("/students/notes/:noteId", handlers.UpdateStudentNote(noteRepo))
		admin.DELETE("/students/notes/:noteId", handlers.DeleteStudentNote(noteRepo))
	}

	return router
}
