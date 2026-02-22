// scripts/seed_interview_form.go
// Script para criar formulário inicial de entrevista no MongoDB

package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	fmt.Println("=== CECOR: Seed de Formulário de Entrevista ===")

	// MongoDB connection
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		// Default for local development
		mongoURI = "mongodb://admin:admin123@localhost:27017/cecor?authSource=admin"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Erro ao conectar ao MongoDB: %v", err)
	}
	defer client.Disconnect(ctx)

	// Test connection
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Erro ao pingar MongoDB: %v", err)
	}

	fmt.Println("✅ Conectado ao MongoDB")

	// Get collections
	db := client.Database("cecor")
	formCollection := db.Collection("form_definitions")

	// Check if form already exists
	var existingForm models.FormDefinition
	err = formCollection.FindOne(ctx, map[string]interface{}{"version": "v1_2026"}).Decode(&existingForm)
	if err == nil {
		fmt.Println("ℹ️  Formulário v1_2026 já existe. Pulando seed.")
		fmt.Printf("   ID: %s\n", existingForm.ID.Hex())
		fmt.Printf("   Título: %s\n", existingForm.Title)
		return
	}

	// Create form definition
	form := models.FormDefinition{
		Title:       "Perfil Socioeducacional 2026",
		Version:     "v1_2026",
		Description: "Formulário de avaliação socioeducacional para novos alunos do CECOR. Este questionário ajuda a entender melhor o perfil, necessidades e expectativas dos alunos.",
		IsActive:    true,
		Questions: []models.Question{
			{
				ID:       "trabalha_atualmente",
				Label:    "Você trabalha atualmente?",
				Type:     "boolean",
				Required: true,
			},
			{
				ID:       "escolaridade",
				Label:    "Qual sua escolaridade atual?",
				Type:     "select",
				Options:  []string{"Fundamental Incompleto", "Fundamental Completo", "Médio Incompleto", "Médio Completo", "Superior Incompleto", "Superior Completo"},
				Required: true,
			},
			{
				ID:       "renda_familiar",
				Label:    "Renda familiar mensal aproximada?",
				Type:     "select",
				Options:  []string{"Até 1 salário mínimo", "1 a 2 salários mínimos", "2 a 3 salários mínimos", "3 a 5 salários mínimos", "Acima de 5 salários mínimos", "Prefiro não informar"},
				Required: false,
			},
			{
				ID:       "acesso_internet",
				Label:    "Possui acesso à internet em casa?",
				Type:     "boolean",
				Required: true,
			},
			{
				ID:       "possui_computador",
				Label:    "Possui computador/notebook em casa?",
				Type:     "boolean",
				Required: true,
			},
			{
				ID:          "cursos_anteriores",
				Label:       "Quais cursos já fez no CECOR? (Se for primeira vez, deixe em branco)",
				Type:        "multiple_choice",
				Options:     []string{"Violão", "Informática", "Costura", "Inglês", "Espanhol", "Teatro", "Dança", "Outro"},
				Required:    false,
				Placeholder: "Selecione todos que se aplicam",
			},
			{
				ID:          "expectativas",
				Label:       "Quais suas expectativas com o curso?",
				Type:        "text",
				Required:    true,
				Placeholder: "Descreva o que espera aprender e como pretende usar esse conhecimento...",
			},
			{
				ID:          "motivacao",
				Label:       "O que te motivou a se inscrever no CECOR?",
				Type:        "text",
				Required:    false,
				Placeholder: "Conte-nos como conheceu o projeto e por que decidiu participar...",
			},
			{
				ID:       "como_conheceu",
				Label:    "Como conheceu o CECOR?",
				Type:     "select",
				Options:  []string{"Indicação de amigo/familiar", "Redes sociais (Facebook, Instagram, etc.)", "Escola", "Igreja/Comunidade", "Panfleto/Cartaz", "Outro"},
				Required: false,
			},
			{
				ID:          "observacoes",
				Label:       "Observações adicionais",
				Type:        "text",
				Required:    false,
				Placeholder: "Alguma informação relevante sobre sua situação que gostaria de compartilhar?",
			},
		},
		CreatedAt: time.Now(),
	}

	// Insert form
	_, err = formCollection.InsertOne(ctx, form)
	if err != nil {
		log.Fatalf("Erro ao inserir formulário: %v", err)
	}

	fmt.Println("✅ Formulário criado com sucesso!")
	fmt.Printf("   Título: %s\n", form.Title)
	fmt.Printf("   Versão: %s\n", form.Version)
	fmt.Printf("   Perguntas: %d\n", len(form.Questions))
	fmt.Println("\n=== Seed Concluído ===")
}

// Helper to get env with default
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
