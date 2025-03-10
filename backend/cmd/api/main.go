package main

import (
	"github.com/devdavidalonso/cecor-backend/internal/database"
	"github.com/devdavidalonso/cecor-backend/internal/handlers"
	"github.com/gin-gonic/gin"
	"log"
	"os"
)

func main() {
	// Configurar o modo do Gin
	if os.Getenv("GO_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Iniciar router
	router := gin.Default()

	// Configurar CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Inicializar conexão com banco de dados
	db, err := database.NewDBConnection()
	if err != nil {
		log.Fatalf("Falha ao conectar ao banco de dados: %v", err)
	}
	defer db.Close()

	// Inicializar repositório e handlers
	repo := database.NewRepository(db)
	h := handlers.NewHandler(repo)

	// Configurar rotas
	api := router.Group("/api")
	{
		// Rotas de alunos
		api.GET("/alunos", h.GetAlunos)
		api.GET("/alunos/:id", h.GetAluno)
		api.POST("/alunos", h.CreateAluno)

		// Rotas de cursos
		api.GET("/cursos", h.GetCursos)
		api.GET("/cursos/:id", h.GetCurso)

		// Rotas de matrículas
		api.GET("/matriculas", h.GetMatriculas)
		api.GET("/matriculas/curso/:id", h.GetMatriculasByCurso)
		api.POST("/matriculas", h.CreateMatricula)
	}

	// Iniciar o servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciado na porta %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}