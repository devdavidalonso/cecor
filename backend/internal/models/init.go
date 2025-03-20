// models/init.go
package models

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB é a instância de conexão com o banco de dados
var DB *gorm.DB

// InitDB inicializa a conexão com o banco de dados
func InitDB(dsn string) error {
	var err error

	// Configuração do logger do GORM
	logConfig := logger.Config{
		LogLevel: logger.Info, // Nível de log (Error, Warn, Info, Silent)
	}

	// Conectar ao banco de dados
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.New(log.Default(), logConfig),
	})
	if err != nil {
		return fmt.Errorf("falha ao conectar ao banco de dados: %w", err)
	}

	// Executar migrações automáticas
	err = migrateDatabase()
	if err != nil {
		return fmt.Errorf("falha na migração do banco de dados: %w", err)
	}

	return nil
}

// migrateDatabase executa as migrações automaticamente
func migrateDatabase() error {
	// Migrações das tabelas usando GORM AutoMigrate
	err := DB.AutoMigrate(
		&User{},
		&Student{},
		&Guardian{},
		&GuardianPermissions{},
		&StudentNote{},
		&Document{},
		&Course{},
		&Enrollment{},
		&Attendance{},
		&AbsenceJustification{},
		&AbsenceAlert{},
		&Notification{},
		&Form{},
		&FormQuestion{},
		&Interview{},
		&FormResponse{},
		&FormAnswerDetail{},
		&Certificate{},
		&CertificateTemplate{},
		&VolunteerTermTemplate{},
		&VolunteerTerm{},
		&VolunteerTermHistory{},
		&AuditLog{},
	)

	if err != nil {
		return err
	}

	return nil
}

// CloseDB fecha a conexão com o banco de dados
func CloseDB() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
