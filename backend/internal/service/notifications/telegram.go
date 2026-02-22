// backend/internal/service/notifications/telegram.go
package notifications

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// TelegramService gerencia comunicação com Telegram Bot API
type TelegramService struct {
	botToken string
	apiURL   string
	client   *http.Client
}

// NewTelegramService cria uma nova instância do serviço Telegram
func NewTelegramService(botToken string) *TelegramService {
	if botToken == "" {
		return nil // Retorna nil se não configurado
	}
	return &TelegramService{
		botToken: botToken,
		apiURL:   fmt.Sprintf("https://api.telegram.org/bot%s", botToken),
		client:   &http.Client{},
	}
}

// IsConfigured retorna true se o serviço está configurado
func (s *TelegramService) IsConfigured() bool {
	return s != nil && s.botToken != ""
}

// SendMessage envia uma mensagem de texto
func (s *TelegramService) SendMessage(chatID string, text string) error {
	if !s.IsConfigured() {
		return fmt.Errorf("telegram service not configured")
	}

	url := fmt.Sprintf("%s/sendMessage", s.apiURL)
	
	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "HTML",
	}

	return s.sendRequest(url, payload)
}

// SendMessageWithButtons envia mensagem com botões inline
func (s *TelegramService) SendMessageWithButtons(chatID string, text string, buttons []InlineButton) error {
	if !s.IsConfigured() {
		return fmt.Errorf("telegram service not configured")
	}

	url := fmt.Sprintf("%s/sendMessage", s.apiURL)
	
	// Formatar botões para Telegram
	var keyboard [][]map[string]string
	for _, btn := range buttons {
		row := []map[string]string{
			{
				"text":          btn.Text,
				"callback_data": btn.CallbackData,
			},
		}
		keyboard = append(keyboard, row)
	}

	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "HTML",
		"reply_markup": map[string]interface{}{
			"inline_keyboard": keyboard,
		},
	}

	return s.sendRequest(url, payload)
}

// InlineButton representa um botão inline
type InlineButton struct {
	Text         string
	CallbackData string
}

// GetUpdates obtém atualizações do bot (para capturar chat_id)
func (s *TelegramService) GetUpdates() ([]Update, error) {
	if !s.IsConfigured() {
		return nil, fmt.Errorf("telegram service not configured")
	}

	url := fmt.Sprintf("%s/getUpdates", s.apiURL)
	
	resp, err := s.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		OK      bool     `json:"ok"`
		Result  []Update `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result.OK {
		return nil, fmt.Errorf("telegram API error")
	}

	return result.Result, nil
}

// Update representa uma atualização do Telegram
type Update struct {
	UpdateID int `json:"update_id"`
	Message  *struct {
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		From *struct {
			ID        int64  `json:"id"`
			Username  string `json:"username"`
			FirstName string `json:"first_name"`
		} `json:"from"`
		Text string `json:"text"`
	} `json:"message"`
}

// sendRequest envia requisição POST para a API do Telegram
func (s *TelegramService) sendRequest(url string, payload interface{}) error {
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := s.client.Post(url, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram API returned status %d", resp.StatusCode)
	}

	var result struct {
		OK      bool   `json:"ok"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	if !result.OK {
		return fmt.Errorf("telegram API error: %s", result.Description)
	}

	return nil
}

// FormatMessage formata mensagem com emoji e HTML
func FormatMessage(emoji string, title string, content string) string {
	return fmt.Sprintf("%s <b>%s</b>\n\n%s", emoji, title, content)
}

// FormatAlert formata alerta de frequência baixa
func FormatLowAttendanceAlert(courseName string, percent float64) string {
	emoji := "⚠️"
	if percent < 60 {
		emoji = "🚨"
	}
	return FormatMessage(
		emoji,
		"Frequência Baixa",
		fmt.Sprintf("Sua frequência em <b>%s</b> está em <b>%.0f%%</b>.\n\nMínimo necessário: 75%%\nEntre em contato com a coordenação.", courseName, percent),
	)
}

// FormatClassReminder formata lembrete de aula
func FormatClassReminder(courseName string, date string, time string) string {
	return FormatMessage(
		"📅",
		"Lembrete de Aula",
		fmt.Sprintf("Aula de <b>%s</b> amanhã!\n\n📆 Data: %s\n🕐 Horário: %s\n\nNão se esqueça! 😉", courseName, date, time),
	)
}

// FormatSubstitutionRequest formata solicitação de substituição para professor
func FormatSubstitutionRequest(courseName string, date string, originalTeacher string) string {
	return FormatMessage(
		"🔄",
		"Solicitação de Substituição",
		fmt.Sprintf("Você foi selecionado para substituir <b>%s</b> na aula de <b>%s</b> no dia <b>%s</b>.\n\nPor favor, confirme sua disponibilidade.", originalTeacher, courseName, date),
	)
}
