package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"github.com/devdavidalonso/cecor/backend/internal/api/handlers"
	"github.com/devdavidalonso/cecor/backend/internal/api/routes"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/repository/postgres"
	"github.com/devdavidalonso/cecor/backend/internal/service/students"
	"github.com/devdavidalonso/cecor/backend/pkg/logger"
)

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

	// Initialize repositories
	studentRepo := postgres.NewStudentRepository(db)

	// Initialize services
	studentService := students.NewStudentService(studentRepo)

	// Initialize handlers
	studentHandler := handlers.NewStudentHandler(studentService)

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

	// API v1 routes
	r.Route("/api/v1", func(r chi.Router) {
		// Setup auth routes (not implemented here)
		// routes.SetupAuthRoutes(r)

		// Setup student routes
		routes.SetupStudentRoutes(r, studentHandler)

		// Setup other routes
		// routes.SetupCourseRoutes(r, courseHandler)
		// routes.SetupEnrollmentRoutes(r, enrollmentHandler)
		// routes.SetupAttendanceRoutes(r, attendanceHandler)
		// routes.SetupReportRoutes(r, reportHandler)
		// routes.SetupInterviewRoutes(r, interviewHandler)
	})

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
