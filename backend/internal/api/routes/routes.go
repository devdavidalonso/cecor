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