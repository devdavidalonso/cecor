package main

import (
	"fmt"
	"log"

	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s",
		cfg.Database.PostgresHost,
		cfg.Database.PostgresUser,
		cfg.Database.PostgresPassword,
		cfg.Database.PostgresDB,
		cfg.Database.PostgresPort,
		cfg.Database.PostgresSSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migrate existing models to ensure table exists
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	users := []models.User{
		{
			Name:     "Administrador",
			Email:    "administrador@cecor.com",
			Password: "password",
			Profile:  "admin",
			CPF:      "111.111.111-01",
		},
		{
			Name:     "Gestor",
			Email:    "gestor@cecor.com",
			Password: "password",
			Profile:  "manager",
			CPF:      "111.111.111-02",
		},
		{
			Name:     "Professor",
			Email:    "professor@cecor.com",
			Password: "password",
			Profile:  "teacher",
			CPF:      "111.111.111-03",
		},
		{
			Name:     "Aluno",
			Email:    "aluno@cecor.com",
			Password: "password",
			Profile:  "student",
			CPF:      "111.111.111-04",
		},
		{
			Name:     "Responsável",
			Email:    "responsavel@cecor.com",
			Password: "password",
			Profile:  "guardian",
			CPF:      "111.111.111-05",
		},
		{
			Name:     "User",
			Email:    "user@cecor.com",
			Password: "password",
			Profile:  "user",
			CPF:      "111.111.111-06",
		},
		{
			Name:     "Admin",
			Email:    "admin@cecor.com",
			Password: "admin",
			Profile:  "admin",
			CPF:      "111.111.111-07",
		},
	}

	for _, u := range users {
		var count int64
		db.Model(&models.User{}).Where("email = ?", u.Email).Count(&count)
		if count > 0 {
			log.Printf("User %s already exists, skipping...", u.Email)
			continue
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password for %s: %v", u.Email, err)
			continue
		}
		u.Password = string(hashedPassword)
		u.Active = true

		if err := db.Create(&u).Error; err != nil {
			log.Printf("Failed to create user %s: %v", u.Email, err)
		} else {
			log.Printf("User %s created successfully.", u.Email)
		}
	}
}
