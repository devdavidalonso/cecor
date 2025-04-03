package postgres

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// InitDB initializes the PostgreSQL database connection and performs migrations
func InitDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.PostgresHost,
		cfg.Database.PostgresPort,
		cfg.Database.PostgresUser,
		cfg.Database.PostgresPassword,
		cfg.Database.PostgresDB,
		cfg.Database.PostgresSSLMode,
	)

	// Configure GORM logger
	gormLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Connect to the database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to configure connection pool: %w", err)
	}

	// Set connection pool parameters
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

// MigrateDB performs database migrations
func MigrateDB(db *gorm.DB) error {
	// Lista de todos os modelos para migração
	models := []interface{}{
		// User related models
		&models.User{},
		&models.UserProfile{},

		// Student related models
		&models.Student{},
		&models.Guardian{},
		&models.GuardianPermissions{},
		&models.StudentNote{},
		&models.Document{},

		// Course related models
		&models.Course{},
		&models.TeacherCourse{},

		// Enrollment related models
		&models.Enrollment{},
		&models.Registration{}, // Legacy

		// Attendance related models
		&models.Attendance{},
		// &models.AttendanceLegacy{}, // Legacy
		&models.AbsenceJustification{},
		&models.AbsenceAlert{},

		// Certificate related models
		&models.Certificate{},
		&models.CertificateTemplate{},

		// Form and Interview related models
		&models.Form{},
		&models.FormQuestion{},
		&models.Interview{},
		&models.FormResponse{},
		&models.FormAnswerDetail{},

		// Volunteer related models
		&models.VolunteerTermTemplate{},
		&models.VolunteerTerm{},
		&models.VolunteerTermHistory{},

		// System models
		&models.Notification{},
		&models.AuditLog{},
	}

	// Migrar cada modelo individualmente
	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Warning: error migrating %T: %v", model, err)
			// Continua com o próximo modelo, não interrompe a migração
		}
	}

	return nil
}
