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

// DB é a instância global do banco de dados
var DB *gorm.DB

// InitDB inicializa a conexão com o banco de dados PostgreSQL
func InitDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.PostgresHost,
		cfg.Database.PostgresPort,
		cfg.Database.PostgresUser,
		cfg.Database.PostgresPassword,
		cfg.Database.PostgresDB,
		cfg.Database.PostgresSSLMode,
	)

	// Configurar logger do GORM
	gormLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Conectar ao banco de dados
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar no banco de dados: %w", err)
	}

	// Configurar pool de conexões
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("falha ao configurar pool de conexões: %w", err)
	}

	// SetMaxIdleConns define o número máximo de conexões no pool de conexões idle.
	sqlDB.SetMaxIdleConns(10)
	// SetMaxOpenConns define o número máximo de conexões abertas com o banco de dados.
	sqlDB.SetMaxOpenConns(100)
	// SetConnMaxLifetime define o tempo máximo que uma conexão pode ser reutilizada.
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Armazenar a instância do DB globalmente
	DB = db

	return db, nil
}

// MigrateDB realiza a migração do banco de dados
func MigrateDB(db *gorm.DB) error {
	// Modelos principais
	if err := db.AutoMigrate(
		&models.Usuario{},
		&models.PerfilUsuario{},
		&models.Permissao{},
		&models.PermissaoPerfil{},
		&models.LogAcesso{},
		&models.LogAuditoria{},
		&models.Aluno{},
		&models.Responsavel{},
		&models.Documento{},
		&models.NotaAluno{},
		&models.Curso{},
		&models.ProfessorCurso{},
		&models.MaterialCurso{},
		&models.AulaCurso{},
		&models.Matricula{},
		&models.HistoricoMatricula{},
		&models.ListaEspera{},
		&models.Certificado{},
		&models.ModeloCertificado{},
		&models.Presenca{},
		&models.JustificativaAusencia{},
		&models.AlertaAusencia{},
		&models.CompensacaoFalta{},
		&models.Notificacao{},
		&models.CanalNotificacao{},
		&models.ConfiguracaoNotificacao{},
		&models.ModeloNotificacao{},
		&models.AgendamentoNotificacao{},
		&models.Formulario{},
		&models.Pergunta{},
		&models.Entrevista{},
		&models.RespostaFormulario{},
		&models.DetalhesResposta{},
		&models.ModeloTermoVoluntariado{},
		&models.TermoVoluntariado{},
		&models.HistoricoTermoVoluntariado{},
	); err != nil {
		return fmt.Errorf("erro na migração do banco de dados: %w", err)
	}

	return nil
}
