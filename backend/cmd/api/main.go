// cmd/api/main.go
package main

import (
	"log"
	"os"

	"github.com/devdavidalonso/cecor/internal/api/routes"
	"github.com/devdavidalonso/cecor/pkg/database"
	"github.com/joho/godotenv"
)

func main() {
	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Println("Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	// Inicializar conexão com banco
	if err := database.InitDB(); err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
	}

	// Inicializar router
	router := routes.SetupRouter()

	// Definir porta
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Porta padrão
	}

	// Iniciar servidor
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Erro ao iniciar servidor: %v", err)
	}
}