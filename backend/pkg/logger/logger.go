package logger

import (
	"fmt"
	"net"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// configureLogstash adiciona um novo sink para Logstash
func configureLogstash(writers *[]zapcore.WriteSyncer) {
	if os.Getenv("ENABLE_ELK") == "true" {
		logstashAddr := os.Getenv("LOGSTASH_ADDR")
		if logstashAddr == "" {
			logstashAddr = "logstash:5000"
		}

		// Configuração para enviar logs para o Logstash
		conn, err := net.Dial("tcp", logstashAddr)
		if err != nil {
			fmt.Printf("Failed to connect to Logstash: %v\n", err)
		} else {
			// Adicionar um writer para enviar logs para o Logstash
			// Note que isso é um exemplo simplificado
			// Em produção, você precisaria de um cliente mais robusto
			*writers = append(*writers, zapcore.AddSync(conn))
		}
	}
}

// Logger é uma interface para logging
type Logger interface {
	Debug(msg string, keysAndValues ...interface{})
	Info(msg string, keysAndValues ...interface{})
	Warn(msg string, keysAndValues ...interface{})
	Error(msg string, keysAndValues ...interface{})
	Fatal(msg string, keysAndValues ...interface{})
	Sync() error
}

// zapLogger implementa a interface Logger usando zap
type zapLogger struct {
	logger *zap.SugaredLogger
}

// NewLogger cria uma nova instância de Logger
func NewLogger() Logger {
	// Determinar se estamos em produção
	isProduction := os.Getenv("APP_ENV") == "production"

	// Configurar encoder
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.TimeKey = "timestamp"
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	// Escolher encoder e nível de log com base no ambiente
	var encoder zapcore.Encoder
	var logLevel zapcore.Level

	if isProduction {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
		logLevel = zapcore.InfoLevel
	} else {
		encoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
		logLevel = zapcore.DebugLevel
	}

	// Preparar os writers para os logs
	writers := []zapcore.WriteSyncer{zapcore.AddSync(os.Stdout)}

	// Adicionar Logstash como um writer adicional, se configurado
	configureLogstash(&writers)

	// Criar core com múltiplos escritores
	core := zapcore.NewCore(
		encoder,
		zapcore.NewMultiWriteSyncer(writers...),
		logLevel,
	)

	// Criar logger
	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return &zapLogger{
		logger: logger.Sugar(),
	}
}

// Debug loga em nível de debug
func (l *zapLogger) Debug(msg string, keysAndValues ...interface{}) {
	l.logger.Debugw(msg, keysAndValues...)
}

// Info loga em nível de info
func (l *zapLogger) Info(msg string, keysAndValues ...interface{}) {
	l.logger.Infow(msg, keysAndValues...)
}

// Warn loga em nível de aviso
func (l *zapLogger) Warn(msg string, keysAndValues ...interface{}) {
	l.logger.Warnw(msg, keysAndValues...)
}

// Error loga em nível de erro
func (l *zapLogger) Error(msg string, keysAndValues ...interface{}) {
	l.logger.Errorw(msg, keysAndValues...)
}

// Fatal loga em nível fatal e encerra a aplicação
func (l *zapLogger) Fatal(msg string, keysAndValues ...interface{}) {
	l.logger.Fatalw(msg, keysAndValues...)
}

// Sync finaliza o logger corretamente
func (l *zapLogger) Sync() error {
	return l.logger.Sync()
}
