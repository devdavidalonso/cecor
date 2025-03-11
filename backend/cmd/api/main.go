package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/devdavidalonso/cecor/internal/database"
	"github.com/devdavidalonso/cecor/internal/handlers"
	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

func main() {
	// Configurar o ambiente
	setupEnvironment()

	// Conectar ao banco de dados
	db, err := setupDatabase()
	if err != nil {
		log.Fatalf("Falha ao configurar o banco de dados: %v", err)
	}
	defer db.Close()

	// Inicializar repositórios
	repos := initializeRepositories(db)

	// Configurar o router
	r := setupRouter(repos)

	// Iniciar o servidor
	startServer(r)
}

// setupEnvironment configura o ambiente de execução
func setupEnvironment() {
	// Configurar o modo do Gin
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}
}

// initializeRepositories cria os repositórios
func initializeRepositories(db *gorm.DB) struct {
	AlunoRepo       *database.AlunoRepository
	CursoRepo       *database.CursoRepository
	MatriculaRepo   *database.MatriculaRepository
	ResponsavelRepo *database.ResponsavelRepository
} {
	return struct {
		AlunoRepo       *database.AlunoRepository
		CursoRepo       *database.CursoRepository
		MatriculaRepo   *database.MatriculaRepository
		ResponsavelRepo *database.ResponsavelRepository
	}{
		AlunoRepo:       database.NewAlunoRepository(db),
		CursoRepo:       database.NewCursoRepository(db),
		MatriculaRepo:   database.NewMatriculaRepository(db),
		ResponsavelRepo: database.NewResponsavelRepository(db),
	}
}

// setupRouter configura as rotas e middlewares
func setupRouter(repos struct {
	AlunoRepo       *database.AlunoRepository
	CursoRepo       *database.CursoRepository
	MatriculaRepo   *database.MatriculaRepository
	ResponsavelRepo *database.ResponsavelRepository
}) *gin.Engine {
	// Configurar o router
	r := gin.New()

	// Configurar CORS com origens específicas
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",     // Frontend de desenvolvimento
			"http://127.0.0.1:3000",     // Localhost alternativo
			"http://localhost:8080",     // Backend
			"http://127.0.0.1:8080",     // Backend alternativo
			"https://seudominio.com.br", // Domínio de produção
		},
		
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Middleware de log
	r.Use(gin.Logger())

	// Middleware de recuperação de pânico
	r.Use(gin.Recovery())

	// Inicializar handlers
	alunoHandler := handlers.NewAlunoHandler(repos.AlunoRepo)
	cursoHandler := handlers.NewCursoHandler(repos.CursoRepo)
	matriculaHandler := handlers.NewMatriculaHandler(repos.MatriculaRepo)
	responsavelHandler := handlers.NewResponsavelHandler(repos.ResponsavelRepo)

	// Definir rotas
	api := r.Group("/api")
	{
		// Rotas para alunos
		alunos := api.Group("/alunos")
		{
			alunos.GET("/", alunoHandler.GetAlunos)
			alunos.GET("/:id", alunoHandler.GetAluno)
			alunos.POST("/", alunoHandler.CreateAluno)
			alunos.PUT("/:id", alunoHandler.UpdateAluno)
			alunos.DELETE("/:id", alunoHandler.DeleteAluno)
		}

		// Rotas para cursos
		cursos := api.Group("/cursos")
		{
			cursos.GET("/", cursoHandler.GetCursos)
			cursos.GET("/:id", cursoHandler.GetCurso)
			cursos.POST("/", cursoHandler.CreateCurso)
			cursos.PUT("/:id", cursoHandler.UpdateCurso)
			cursos.DELETE("/:id", cursoHandler.DeleteCurso)
		}

		// Rotas para matrículas
		matriculas := api.Group("/matriculas")
		{
			matriculas.GET("/", matriculaHandler.GetMatriculas)
			matriculas.GET("/:id", matriculaHandler.GetMatricula)
			matriculas.POST("/", matriculaHandler.CreateMatricula)
			matriculas.PUT("/:id", matriculaHandler.UpdateMatricula)
			matriculas.DELETE("/:id", matriculaHandler.DeleteMatricula)
		}

		// Rotas para responsáveis
		responsaveis := api.Group("/responsaveis")
		{
			responsaveis.GET("/", responsavelHandler.GetResponsaveis)
			responsaveis.GET("/:id", responsavelHandler.GetResponsavel)
			responsaveis.POST("/", responsavelHandler.CreateResponsavel)
			responsaveis.PUT("/:id", responsavelHandler.UpdateResponsavel)
			responsaveis.DELETE("/:id", responsavelHandler.DeleteResponsavel)
		}
	}

	return r
}

// startServer inicia o servidor HTTP
func startServer(r *gin.Engine) {
	// Obter a porta do ambiente ou usar padrão
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Mensagem de inicialização do servidor
	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("Iniciando servidor na porta %s", port)

	// Iniciar o servidor
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Falha ao iniciar o servidor: %v", err)
	}
}

// setupDatabase configura a conexão com o banco de dados
func setupDatabase() (*gorm.DB, error) {
	// Obter a string de conexão do ambiente ou usar um valor padrão
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Usar valores padrão para ambiente de desenvolvimento
		dsn = "root:password@tcp(mysql:3306)/cecor_db?charset=utf8mb4&parseTime=True&loc=Local"
	}

	// Conectar ao banco de dados MySQL
	db, err := gorm.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao banco de dados: %v", err)
	}

	// Configurar o logger do GORM apenas em modo de desenvolvimento
	if gin.Mode() != gin.ReleaseMode {
		db.LogMode(true)
	}
	
	// Auto-migrar para criar/atualizar as tabelas
	// Em produção, considere usar migrações explícitas
	if err := db.AutoMigrate(
		&models.Aluno{},
		&models.Responsavel{},
		&models.Curso{},
		&models.Matricula{},
	).Error; err != nil {
		return nil, fmt.Errorf("falha na migração do banco de dados: %v", err)
	}
	
	return db, nil
}