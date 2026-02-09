package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt" // Adicione esta importação para o bcrypt
	"gorm.io/gorm"

	"github.com/devdavidalonso/cecor/backend/internal/api/handlers"
	"github.com/devdavidalonso/cecor/backend/internal/api/routes"
	"github.com/devdavidalonso/cecor/backend/internal/auth"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository/postgres"
	"github.com/devdavidalonso/cecor/backend/internal/service"
	"github.com/devdavidalonso/cecor/backend/internal/service/courses"  // Adicionar importação de courses
	"github.com/devdavidalonso/cecor/backend/internal/service/students" // Adicionar importação de students
	"github.com/devdavidalonso/cecor/backend/internal/service/users"    // Adicionar esta importação
	"github.com/devdavidalonso/cecor/backend/pkg/logger"
)

// Adicione esta função para atualizar a senha do usuário
func updateUserPassword(db *gorm.DB, email, password string) {
	// Gerar novo hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Erro ao gerar hash: %v", err)
		return
	}

	// Atualizar no banco
	result := db.Model(&models.User{}).
		Where("email = ?", email).
		Update("password", string(hashedPassword))

	if result.Error != nil {
		log.Printf("Erro ao atualizar senha: %v", result.Error)
	} else {
		log.Printf("Senha atualizada com sucesso para %s", email)
	}
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize logger
	appLogger := logger.NewLogger()
	appLogger.Info("Starting CECOR Educational Management System")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		appLogger.Fatal("Failed to load configuration", "error", err)
	}

	// Initialize SSO Provider
	// Extract issuer URL from AuthURL (remove the /protocol/openid-connect/auth part)
	issuerURL := strings.TrimSuffix(cfg.SSO.AuthURL, "/protocol/openid-connect/auth")
	if err := auth.InitProvider(context.Background(), issuerURL); err != nil {
		appLogger.Fatal("Failed to initialize SSO provider", "error", err)
	}

	// Initialize database
	db, err := postgres.InitDB(cfg)
	if err != nil {
		appLogger.Fatal("Failed to connect to database", "error", err)
	}

	// Perform database migrations
	err = postgres.MigrateDB(db)
	if err != nil {
		appLogger.Fatal("Failed to migrate database", "error", err)
	}
	appLogger.Info("Database migration completed successfully")

	// Atualizar senha do usuário de teste
	updateUserPassword(db, "maria.silva@cecor.org", "cecor2024!")

	// Initialize repositories
	studentRepo := postgres.NewStudentRepository(db)
	userRepo := postgres.NewUserRepository(db)     // Adicionar o repositório de usuários
	courseRepo := postgres.NewCourseRepository(db) // Adicionar repositório de cursos

	// Initialize services
	keycloakService := service.NewKeycloakService()                                          // Inicializar Keycloak service
	emailService := service.NewEmailService()                                                // Inicializar Email service
	studentService := students.NewStudentService(studentRepo, keycloakService, emailService) // Inicializar student service com Keycloak e Email
	userService := users.NewUserService(userRepo)                                            // Adicionar o serviço de usuários
	courseService := courses.NewService(courseRepo)                                          // Adicionar serviço de cursos

	// Initialize SSO Config
	ssoConfig := auth.NewSSOConfig(cfg)

	// Initialize handlers
	studentHandler := handlers.NewStudentHandler(studentService)
	authHandler := handlers.NewAuthHandler(userService, cfg, ssoConfig) // Adicionar o handler de autenticação
	courseHandler := handlers.NewCourseHandler(courseService)           // Adicionar handler de cursos

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	// CORS middleware
	r.Use(middleware.SetHeader("Access-Control-Allow-Origin", "*"))
	r.Use(middleware.SetHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"))
	r.Use(middleware.SetHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"))

	// Options handling for CORS preflight requests
	r.Options("/*", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Health check route
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Registrar todas as rotas, incluindo autenticação
	routes.Register(r, cfg, authHandler, courseHandler)

	// ROTA DE TESTE TEMPORÁRIA - SEM AUTENTICAÇÃO (remover após testes)
	r.Route("/api/v1/test/students", func(r chi.Router) {
		r.Post("/", studentHandler.CreateStudent)
		r.Get("/", studentHandler.GetStudents)
		r.Get("/{id}", studentHandler.GetStudent)
	})

	// Registrar rotas de students (COM autenticação via middleware do handler)
	r.Route("/api/v1/students", func(r chi.Router) {
		r.Get("/", studentHandler.GetStudents)
		r.Post("/", studentHandler.CreateStudent)
		r.Get("/{id}", studentHandler.GetStudent)
		r.Put("/{id}", studentHandler.UpdateStudent)
		r.Delete("/{id}", studentHandler.DeleteStudent)
		r.Get("/{id}/guardians", studentHandler.GetGuardians)
		r.Post("/{id}/guardians", studentHandler.AddGuardian)
		r.Get("/{id}/documents", studentHandler.GetDocuments)
		r.Post("/{id}/documents", studentHandler.AddDocument)
		r.Get("/{id}/notes", studentHandler.GetNotes)
		r.Post("/{id}/notes", studentHandler.AddNote)
	})

	// API v1 routes (deixar comentado ou remover, pois já estamos usando routes.Register)
	/*
		r.Route("/api/v1", func(r chi.Router) {
			// Setup student routes
			routes.SetupStudentRoutes(r, studentHandler)

			// Setup other routes
			// routes.SetupCourseRoutes(r, courseHandler)
			// routes.SetupEnrollmentRoutes(r, enrollmentHandler)
			// routes.SetupAttendanceRoutes(r, attendanceHandler)
			// routes.SetupReportRoutes(r, reportHandler)
			// routes.SetupInterviewRoutes(r, interviewHandler)
		})
	*/

	// Get server port
	port := cfg.Server.Port
	addr := fmt.Sprintf(":%d", port)

	// Create HTTP server
	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// Imprimir todas as rotas registradas
	chi.Walk(r, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		fmt.Printf("%s %s\n", method, route)
		return nil
	})

	// Start server in a goroutine
	go func() {
		appLogger.Info("Server starting", "port", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Fatal("Server error", "error", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	appLogger.Info("Shutting down server...")

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		appLogger.Fatal("Server forced to shutdown", "error", err)
	}

	appLogger.Info("Server gracefully stopped")
}
