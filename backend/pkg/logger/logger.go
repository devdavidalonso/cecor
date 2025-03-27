package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

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

	// Criar core
	core := zapcore.NewCore(
		encoder,
		zapcore.AddSync(os.Stdout),
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
