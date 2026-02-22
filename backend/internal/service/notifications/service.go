// backend/internal/service/notifications/service.go
package notifications

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"gorm.io/gorm"
)

// Priority representa a prioridade da notificação
type Priority string

const (
	PriorityUrgent   Priority = "urgent"   // Modal bloqueante
	PriorityHigh     Priority = "high"     // Banner persistente
	PriorityMedium   Priority = "medium"   // In-APP normal
	PriorityLow      Priority = "low"      // Só email/resumo
)

// Channel representa o canal de entrega
type Channel string

const (
	ChannelEmail    Channel = "email"
	ChannelTelegram Channel = "telegram"
	ChannelInApp    Channel = "inapp"
)

// NotificationRequest representa uma solicitação de notificação
type NotificationRequest struct {
	UserID        uint                   // Destinatário
	EventType     string                 // Tipo do evento
	Title         string                 // Título
	Message       string                 // Mensagem
	Priority      Priority               // Prioridade
	Data          map[string]interface{} // Dados extras
	ActionURL     string                 // Link para ação
	ForceInApp    bool                   // Forçar visualização in-app
}

// Service interface para o serviço de notificações
type Service interface {
	SendNotification(ctx context.Context, req NotificationRequest) error
	SendToMultiple(ctx context.Context, userIDs []uint, req NotificationRequest) error
}

type service struct {
	db              *gorm.DB
	telegramService *TelegramService
	// emailService seria adicionado aqui
}

// NewService cria uma nova instância do serviço
func NewService(db *gorm.DB, telegramToken string) Service {
	return &service{
		db:              db,
		telegramService: NewTelegramService(telegramToken),
	}
}

// SendNotification envia notificação pelos canais apropriados
func (s *service) SendNotification(ctx context.Context, req NotificationRequest) error {
	log.Printf("📨 Enviando notificação: %s (prioridade: %s) para usuário %d", 
		req.EventType, req.Priority, req.UserID)

	// 1. SEMPRE salvar In-APP no banco
	if err := s.saveInAppNotification(req); err != nil {
		log.Printf("❌ Erro ao salvar notificação In-APP: %v", err)
	}

	// 2. Verificar preferências do usuário
	channels := s.getUserChannels(req.UserID, req.Priority)

	// 3. Enviar por cada canal habilitado
	var errors []error

	// Telegram (para alta prioridade)
	if channels.Telegram && req.Priority != PriorityLow {
		if err := s.sendTelegram(req); err != nil {
			log.Printf("⚠️  Erro ao enviar Telegram: %v", err)
			errors = append(errors, err)
		}
	}

	// Email (para média/alta prioridade)
	if channels.Email && (req.Priority == PriorityHigh || req.Priority == PriorityUrgent) {
		// TODO: Implementar envio de email
		log.Printf("📧 Email seria enviado (não implementado)")
	}

	// Se houver erros mas In-APP funcionou, não retorna erro crítico
	if len(errors) > 0 && !channels.InApp {
		return fmt.Errorf("falha ao enviar notificação: %v", errors)
	}

	return nil
}

// SendToMultiple envia para múltiplos usuários
func (s *service) SendToMultiple(ctx context.Context, userIDs []uint, req NotificationRequest) error {
	for _, userID := range userIDs {
		req.UserID = userID
		if err := s.SendNotification(ctx, req); err != nil {
			log.Printf("⚠️  Erro ao enviar para usuário %d: %v", userID, err)
			// Continua com os próximos
		}
	}
	return nil
}

// saveInAppNotification salva notificação no banco para exibição no app
type InAppNotification struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index"`
	Title     string    `gorm:"not null"`
	Message   string    `gorm:"type:text"`
	EventType string    `gorm:"not null"`
	Priority  string    `gorm:"not null"`
	Data      string    `gorm:"type:json"` // JSON com dados extras
	ActionURL string
	Read      bool      `gorm:"default:false"`
	ReadAt    *time.Time
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (InAppNotification) TableName() string {
	return "in_app_notifications"
}

func (s *service) saveInAppNotification(req NotificationRequest) error {
	// Garantir que a tabela existe
	if err := s.db.AutoMigrate(&InAppNotification{}); err != nil {
		return err
	}

	dataJSON, _ := json.Marshal(req.Data)

	notif := InAppNotification{
		UserID:    req.UserID,
		Title:     req.Title,
		Message:   req.Message,
		EventType: req.EventType,
		Priority:  string(req.Priority),
		Data:      string(dataJSON),
		ActionURL: req.ActionURL,
	}

	return s.db.Create(&notif).Error
}

// UserChannels representa os canais habilitados para um usuário
type UserChannels struct {
	Email    bool
	Telegram bool
	InApp    bool
}

// getUserChannels retorna os canais habilitados para o usuário
func (s *service) getUserChannels(userID uint, priority Priority) UserChannels {
	// Por padrão, todos os usuários recebem In-APP
	channels := UserChannels{
		Email:    true,  // Default: habilitado
		Telegram: s.telegramService.IsConfigured(),
		InApp:    true,
	}

	// TODO: Buscar preferências reais do usuário no banco
	// Por enquanto usa defaults

	return channels
}

// sendTelegram envia mensagem pelo Telegram
func (s *service) sendTelegram(req NotificationRequest) error {
	if !s.telegramService.IsConfigured() {
		return nil // Silenciosamente ignora se não configurado
	}

	// Buscar chat_id do usuário
	var channel models.NotificationChannel
	if err := s.db.Where("user_id = ? AND type = ? AND active = ?", 
		req.UserID, "telegram", true).
		First(&channel).Error; err != nil {
		return fmt.Errorf("usuário não tem Telegram configurado")
	}

	// Formatar mensagem baseada no tipo de evento
	text := s.formatTelegramMessage(req)

	// Adicionar botões se houver ActionURL
	if req.ActionURL != "" {
		buttons := []InlineButton{
			{Text: "📱 Ver no App", CallbackData: fmt.Sprintf("open:%s", req.ActionURL)},
		}
		return s.telegramService.SendMessageWithButtons(channel.Identifier, text, buttons)
	}

	return s.telegramService.SendMessage(channel.Identifier, text)
}

// formatTelegramMessage formata mensagem para Telegram
func (s *service) formatTelegramMessage(req NotificationRequest) string {
	emoji := s.getEmojiForEvent(req.EventType, req.Priority)
	
	return FormatMessage(
		emoji,
		req.Title,
		req.Message,
	)
}

// getEmojiForEvent retorna emoji apropriado para o evento
func (s *service) getEmojiForEvent(eventType string, priority Priority) string {
	emojis := map[string]string{
		"low_attendance": "⚠️",
		"class_reminder": "📅",
		"substitution":   "🔄",
		"enrollment":     "🎉",
		"incident":       "📋",
		"interview":      "🎤",
		"survey":         "📊",
	}

	if emoji, ok := emojis[eventType]; ok {
		if priority == PriorityUrgent {
			return "🚨"
		}
		return emoji
	}

	if priority == PriorityUrgent {
		return "🚨"
	}
	if priority == PriorityHigh {
		return "⚠️"
	}
	return "📌"
}

// GetUnreadNotifications retorna notificações não lidas do usuário
func (s *service) GetUnreadNotifications(userID uint) ([]InAppNotification, error) {
	var notifications []InAppNotification
	err := s.db.Where("user_id = ? AND read = ?", userID, false).
		Order("created_at DESC").
		Find(&notifications).Error
	return notifications, err
}

// MarkAsRead marca notificação como lida
func (s *service) MarkAsRead(notificationID uint) error {
	now := time.Now()
	return s.db.Model(&InAppNotification{}).
		Where("id = ?", notificationID).
		Updates(map[string]interface{}{
			"read":   true,
			"read_at": now,
		}).Error
}
