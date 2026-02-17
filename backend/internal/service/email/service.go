package email

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
)

// EmailService handles sending emails
type EmailService struct {
	smtpHost     string
	smtpPort     string
	smtpUser     string
	smtpPassword string
	fromEmail    string
	fromName     string
}

// NewEmailService creates a new email service instance
func NewEmailService() *EmailService {
	return &EmailService{
		smtpHost:     os.Getenv("SMTP_HOST"),
		smtpPort:     os.Getenv("SMTP_PORT"),
		smtpUser:     os.Getenv("SMTP_USER"),
		smtpPassword: os.Getenv("SMTP_PASSWORD"),
		fromEmail:    os.Getenv("SMTP_FROM_EMAIL"),
		fromName:     os.Getenv("SMTP_FROM_NAME"),
	}
}

// WelcomeEmailData represents data for welcome email template
type WelcomeEmailData struct {
	StudentName       string
	Email             string
	TemporaryPassword string
	LoginURL          string
	SupportEmail      string
}

// SendWelcomeEmail sends a welcome email with temporary credentials
func (s *EmailService) SendWelcomeEmail(to, studentName, temporaryPassword string) error {
	// Check if SMTP is configured
	if s.smtpHost == "" || s.smtpPort == "" {
		fmt.Printf("SMTP not configured, skipping email. Temporary password: %s\n", temporaryPassword)
		return nil
	}

	data := WelcomeEmailData{
		StudentName:       studentName,
		Email:             to,
		TemporaryPassword: temporaryPassword,
		LoginURL:          os.Getenv("FRONTEND_URL"),
		SupportEmail:      os.Getenv("SUPPORT_EMAIL"),
	}

	subject := "Bem-vindo ao CECOR - Suas Credenciais de Acesso"
	body, err := s.renderWelcomeTemplate(data)
	if err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}

	return s.sendEmail(to, subject, body)
}

// renderWelcomeTemplate renders the welcome email HTML template
func (s *EmailService) renderWelcomeTemplate(data WelcomeEmailData) (string, error) {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .credentials { background-color: #fff; border: 2px solid #4CAF50; padding: 15px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #4CAF50; }
        .credential-value { font-family: monospace; background-color: #f0f0f0; padding: 5px 10px; display: inline-block; }
        .button { background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo ao CECOR!</h1>
        </div>
        
        <div class="content">
            <p>Olá <strong>{{.StudentName}}</strong>,</p>
            
            <p>Sua conta foi criada com sucesso no sistema CECOR (Centro Educacional Comunitário de Referência).</p>
            
            <div class="credentials">
                <h3>Suas Credenciais de Acesso:</h3>
                
                <div class="credential-item">
                    <span class="credential-label">Email:</span><br>
                    <span class="credential-value">{{.Email}}</span>
                </div>
                
                <div class="credential-item">
                    <span class="credential-label">Senha Temporária:</span><br>
                    <span class="credential-value">{{.TemporaryPassword}}</span>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Por segurança, você será solicitado a alterar esta senha no primeiro acesso.
            </div>
            
            <div style="text-align: center;">
                <a href="{{.LoginURL}}" class="button">Acessar o Sistema</a>
            </div>
            
            <h3>Próximos Passos:</h3>
            <ol>
                <li>Clique no botão acima ou acesse: <a href="{{.LoginURL}}">{{.LoginURL}}</a></li>
                <li>Faça login com seu email e senha temporária</li>
                <li>Crie uma nova senha segura quando solicitado</li>
                <li>Complete seu perfil com informações adicionais</li>
            </ol>
            
            <p>Se você tiver alguma dúvida ou precisar de ajuda, entre em contato conosco em: <a href="mailto:{{.SupportEmail}}">{{.SupportEmail}}</a></p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; 2024 CECOR - Centro Educacional Comunitário de Referência</p>
        </div>
    </div>
</body>
</html>
`

	t, err := template.New("welcome").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// sendEmail sends an email using SMTP
func (s *EmailService) sendEmail(to, subject, body string) error {
	// Set up authentication
	auth := smtp.PlainAuth("", s.smtpUser, s.smtpPassword, s.smtpHost)

	// Compose message
	from := fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	msg := []byte(fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"MIME-Version: 1.0\r\n"+
		"Content-Type: text/html; charset=UTF-8\r\n"+
		"\r\n"+
		"%s\r\n", from, to, subject, body))

	// Send email
	addr := fmt.Sprintf("%s:%s", s.smtpHost, s.smtpPort)
	err := smtp.SendMail(addr, auth, s.fromEmail, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	fmt.Printf("✅ Email sent successfully to %s\n", to)
	return nil
}
