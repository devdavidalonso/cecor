package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/devdavidalonso/cecor/backend/internal/api/handlers"
	"github.com/devdavidalonso/cecor/backend/internal/api/routes"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/repository/postgres"
	"github.com/devdavidalonso/cecor/backend/internal/service/usuarios"
	"github.com/devdavidalonso/cecor/backend/pkg/logger"
)

func main() {
	// Inicializar logger
	log := logger.NewLogger()
	log.Info("Iniciando servidor...")

	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Info("Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	// Carregar configurações
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Erro ao carregar configurações", "error", err)
	}

	// Inicializar banco de dados
	db, err := postgres.InitDB(cfg)
	if err != nil {
		log.Fatal("Erro ao conectar com o banco de dados", "error", err)
	}

	// Executar migrações
	if err := postgres.MigrateDB(db); err != nil {
		log.Fatal("Erro ao executar migrações do banco de dados", "error", err)
	}

	// Inicializar repositórios
	usuarioRepo := postgres.NewUsuarioRepository(db)

	// Inicializar serviços
	usuarioService := usuarios.NewUsuarioService(usuarioRepo)

	// Inicializar handlers
	authHandler := handlers.NewAuthHandler(usuarioService, cfg)

	// Criar router
	r := chi.NewRouter()

	// Middlewares básicos
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)

	// Configuração CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // Em produção, especificar origens exatas
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not readily increased on some browsers
	}))

	// Rota de saúde para verificação do servidor
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Registrar rotas da API
	routes.Register(r, cfg, authHandler)

	// Iniciar servidor
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf(":%s", port)
	log.Info("Servidor iniciado", "address", addr)
	err = http.ListenAndServe(addr, r)
	if err != nil {
		log.Fatal("Erro ao iniciar servidor", "error", err)
	}
}
