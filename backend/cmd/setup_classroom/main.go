package main

import (
	"fmt"
	"log"

	"github.com/devdavidalonso/cecor/backend/internal/infrastructure/googleapis"
)

func main() {
	fmt.Println("=== CECOR: Google Classroom API Setup ===")
	fmt.Println("Lendo credentials.json e verificando token...")

	// Pass the path to your credentials.json file
	client, err := googleapis.NewGoogleClassroomClient("./credentials.json")
	if err != nil {
		log.Fatalf("Erro ao configurar cliente Google Classroom: %v", err)
	}

	fmt.Println("\nSucesso! O cliente foi autenticado e o token.json foi gerado/verificado!")
	if client != nil {
		fmt.Println("Tudo pronto para integração.")
	}
}
