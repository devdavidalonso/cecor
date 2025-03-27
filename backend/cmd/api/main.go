package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Println("Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	// Obtém a porta do servidor a partir das variáveis de ambiente ou usa 8080 como padrão
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	// Criar router
	r := chi.NewRouter()

	// Middlewares básicos
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Rota simples para verificar se o servidor está funcionando
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"message": "Hello World!"}`))
		})
	})

	// Iniciar servidor
	addr := fmt.Sprintf(":%s", port)
	log.Printf("Servidor iniciado em %s", addr)
	err := http.ListenAndServe(addr, r)
	if err != nil {
		log.Fatalf("Erro ao iniciar servidor: %v", err)
	}
}
