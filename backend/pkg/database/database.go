package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB

// InitDB inicializa a conexão com o banco de dados
func InitDB() error {
	// Recupera a DSN completa das variáveis de ambiente
	dsn := os.Getenv("DB_DSN")
	
	// Se DSN não estiver definida, construa com variáveis individuais
	if dsn == "" {
		// Configura valores padrão caso não existam variáveis de ambiente
		dbHost := os.Getenv("DB_HOST")
		if dbHost == "" {
			dbHost = "mysql" // Nome do serviço no docker-compose
		}
		
		dbPort := os.Getenv("DB_PORT")
		if dbPort == "" {
			dbPort = "3306"
		}
		
		dbUser := os.Getenv("DB_USER")
		if dbUser == "" {
			dbUser = "root"
		}
		
		dbPass := os.Getenv("DB_PASS")
		if dbPass == "" {
			dbPass = "password" // Senha definida no docker-compose
		}
		
		dbName := os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "cecor_db"
		}

		// Monta a string de conexão
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			dbUser, dbPass, dbHost, dbPort, dbName)
	}

	log.Printf("Tentando conectar ao banco de dados usando: %s", dsn)

	// Configuração do logger do GORM
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
		},
	)

	// Inicializa a conexão com retry
	var err error
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: newLogger,
		})
		if err == nil {
			break // Conexão estabelecida com sucesso
		}
		
		log.Printf("Tentativa %d de %d falhou: %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			// Aguardar antes de tentar novamente (tempo exponencial)
			backoff := time.Duration(1<<uint(i)) * time.Second
			log.Printf("Aguardando %v antes de tentar novamente...", backoff)
			time.Sleep(backoff)
		}
	}
	
	if err != nil {
		return fmt.Errorf("todas as tentativas de conexão falharam: %w", err)
	}

	log.Println("Conexão com o banco de dados estabelecida com sucesso!")

	// Configuração da pool de conexões
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	// SetMaxIdleConns define o número máximo de conexões no pool de conexões ociosas
	sqlDB.SetMaxIdleConns(10)

	// SetMaxOpenConns define o número máximo de conexões abertas com o banco de dados
	sqlDB.SetMaxOpenConns(100)

	// SetConnMaxLifetime define o tempo máximo que uma conexão pode ser reutilizada
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto Migrate para criar as tabelas automaticamente
	log.Println("Iniciando migração automática de tabelas...")
	err = db.AutoMigrate(&models.User{}, &models.Course{}, &models.Enrollment{})
	if err != nil {
		return fmt.Errorf("erro ao migrar tabelas: %w", err)
	}
	log.Println("Migração de tabelas concluída com sucesso!")

	// Inicializa o usuário administrador se não existir
	log.Println("Verificando usuário administrador...")
	err = setupAdminUser()
	if err != nil {
		return fmt.Errorf("erro ao configurar usuário admin: %w", err)
	}
	log.Println("Inicialização do banco de dados concluída com sucesso!")

	return nil
}

// GetDB retorna a conexão com o banco de dados
func GetDB() (*gorm.DB, error) {
	if db == nil {
		return nil, fmt.Errorf("banco de dados não inicializado")
	}
	return db, nil
}

// setupAdminUser cria um usuário administrador inicial se não existir
func setupAdminUser() error {
	var count int64
	db.Model(&models.User{}).Where("profile = ?", "admin").Count(&count)

	// Se não existir admin, criar um
	if count == 0 {
		log.Println("Criando usuário administrador padrão...")
		// Hash da senha (implementação depende do pacote de criptografia utilizado)
		// Aqui estamos usando bcrypt como exemplo
		password := os.Getenv("ADMIN_PASSWORD")
		if password == "" {
			password = "senha_admin_segura" // Senha padrão
		}

		// Criar o usuário admin com data de nascimento válida
		admin := models.User{
			Name:      "Administrador",
			Email:     "admin@sistema.edu",
			Password:  password, // A senha será criptografada no handler
			Profile:   "admin",
			Active:    true,			
		}

		// Salvar no banco
		result := db.Create(&admin)
		if result.Error != nil {
			return result.Error
		}
		log.Println("Usuário administrador criado com sucesso!")
	} else {
		log.Println("Usuário administrador já existe.")
	}

	return nil
}