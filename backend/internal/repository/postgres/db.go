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

	// Adicione esta linha para aumentar o timeout de consulta
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	return db, nil
}

// MigrateDB performs database migrations
func MigrateDB(db *gorm.DB) error {
	// Compatibilidade com bases antigas/incompletas.
	// Garante enum e colunas de Student antes do AutoMigrate.
	if err := ensureStudentSchemaCompatibility(db); err != nil {
		log.Printf("Warning: error ensuring student schema compatibility: %v", err)
	}

	// Lista de todos os modelos para migração
	models := []interface{}{
		// User related models
		&models.User{},
		&models.UserProfile{},
		&models.Address{},
		&models.UserContact{},

		// Student related models
		&models.Student{},
		&models.Guardian{},
		&models.GuardianPermissions{},
		&models.StudentNote{},
		&models.Document{},

		// Course related models
		&models.Course{},
		&models.TeacherCourse{},
		&models.CourseClass{},
		&models.ClassSession{},
		&models.EnrollmentCourseClass{},
		&models.SyllabusTopic{},

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

func ensureStudentSchemaCompatibility(db *gorm.DB) error {
	// Ensure enum exists for student status
	if err := db.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_status') THEN
				CREATE TYPE student_status AS ENUM ('active', 'inactive', 'suspended');
			END IF;
		END
		$$;
	`).Error; err != nil {
		return err
	}

	// If students table already exists from legacy schema, add missing columns safely.
	if err := db.Exec(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = 'public' AND table_name = 'students'
			) THEN
				ALTER TABLE students ADD COLUMN IF NOT EXISTS special_needs text;
				ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_info text;
				ALTER TABLE students ADD COLUMN IF NOT EXISTS social_media jsonb;
				ALTER TABLE students ADD COLUMN IF NOT EXISTS notes text;
			END IF;
		END
		$$;
	`).Error; err != nil {
		return err
	}

	// Compatibilidade com schema legado de users:
	// em algumas bases antigas, a coluna `profile` (texto) é NOT NULL.
	// Como o sistema atual usa `profile_id`, garantimos default para inserts sem essa coluna.
	if err := db.Exec(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_schema = 'public'
				  AND table_name = 'users'
				  AND column_name = 'profile'
			) THEN
				ALTER TABLE users ALTER COLUMN profile SET DEFAULT 'student';
				UPDATE users
				SET profile = 'student'
				WHERE profile IS NULL OR profile = '';
			END IF;
		END
		$$;
	`).Error; err != nil {
		return err
	}

	return nil
}
