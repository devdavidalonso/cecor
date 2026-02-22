// backend/internal/service/notifications/triggers.go
// Gatilhos de notificação nos eventos principais do sistema

package notifications

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// NotificationTriggers encapsula os gatilhos de notificação
type NotificationTriggers struct {
	service Service
	db      *gorm.DB
}

// NewTriggers cria uma nova instância
func NewTriggers(db *gorm.DB, service Service) *NotificationTriggers {
	return &NotificationTriggers{
		service: service,
		db:      db,
	}
}

// === GATILHOS DE FREQUÊNCIA ===

// OnLowAttendance dispara quando frequência do aluno fica baixa
func (t *NotificationTriggers) OnLowAttendance(studentID uint, courseName string, percent float64) {
	req := NotificationRequest{
		UserID:    studentID,
		EventType: "low_attendance",
		Title:     "Frequência Baixa",
		Message:   fmt.Sprintf("Sua frequência em %s está em %.0f%%. Mínimo necessário: 75%%. Entre em contato com a coordenação.", courseName, percent),
		Priority:  PriorityHigh,
		ActionURL: fmt.Sprintf("/student/courses/attendance"),
		Data: map[string]interface{}{
			"courseName": courseName,
			"percent":    percent,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := t.service.SendNotification(ctx, req); err != nil {
		// Log mas não falha a operação principal
		fmt.Printf("Erro ao enviar notificação de frequência baixa: %v\n", err)
	}
}

// === GATILHOS DE AULA ===

// OnClassReminder dispara lembrete 24h antes da aula
func (t *NotificationTriggers) OnClassReminder(studentID uint, courseName string, classDate time.Time) {
	req := NotificationRequest{
		UserID:    studentID,
		EventType: "class_reminder",
		Title:     "Lembrete de Aula",
		Message:   fmt.Sprintf("Aula de %s amanhã às %s! Não se esqueça!", courseName, classDate.Format("15:04")),
		Priority:  PriorityMedium,
		ActionURL: "/student/dashboard",
		Data: map[string]interface{}{
			"courseName": courseName,
			"date":       classDate.Format("02/01/2006"),
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// OnClassCancelled dispara quando aula é cancelada
func (t *NotificationTriggers) OnClassCancelled(studentIDs []uint, courseName string, date string, reason string) {
	req := NotificationRequest{
		EventType: "class_cancelled",
		Title:     "Aula Cancelada",
		Message:   fmt.Sprintf("A aula de %s do dia %s foi cancelada. Motivo: %s", courseName, date, reason),
		Priority:  PriorityUrgent,
		ActionURL: "/student/dashboard",
		ForceInApp: true,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendToMultiple(ctx, studentIDs, req)
}

// === GATILHOS DE SUBSTITUIÇÃO ===

// OnSubstitutionRequested dispara para professor substituto
func (t *NotificationTriggers) OnSubstitutionRequested(substituteTeacherID uint, courseName string, date string, originalTeacher string) {
	req := NotificationRequest{
		UserID:    substituteTeacherID,
		EventType: "substitution",
		Title:     "Solicitação de Substituição",
		Message:   fmt.Sprintf("Você foi selecionado para substituir %s na aula de %s no dia %s. Por favor, confirme sua disponibilidade.", originalTeacher, courseName, date),
		Priority:  PriorityUrgent,
		ActionURL: "/teacher/substitutions",
		ForceInApp: true,
		Data: map[string]interface{}{
			"courseName":      courseName,
			"date":            date,
			"originalTeacher": originalTeacher,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// === GATILHOS DE MATRÍCULA ===

// OnEnrollmentConfirmed dispara quando matrícula é confirmada
func (t *NotificationTriggers) OnEnrollmentConfirmed(studentID uint, courseName string) {
	req := NotificationRequest{
		UserID:    studentID,
		EventType: "enrollment",
		Title:     "Matrícula Confirmada",
		Message:   fmt.Sprintf("Parabéns! Sua matrícula em %s foi confirmada. Bem-vindo ao CECOR!", courseName),
		Priority:  PriorityMedium,
		ActionURL: "/student/dashboard",
		Data: map[string]interface{}{
			"courseName": courseName,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// OnEnrollmentPendingInterview dispara quando matrícula aguarda entrevista
func (t *NotificationTriggers) OnEnrollmentPendingInterview(studentID uint, courseName string) {
	req := NotificationRequest{
		UserID:    studentID,
		EventType: "interview_pending",
		Title:     "Entrevista Agendada",
		Message:   fmt.Sprintf("Sua matrícula em %s está quase completa! Agende sua entrevista socioeducacional.", courseName),
		Priority:  PriorityHigh,
		ActionURL: "/student/interview",
		ForceInApp: true,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// === GATILHOS DE OCORRÊNCIAS ===

// OnIncidentCreated dispara quando ocorrência é registrada envolvendo aluno
func (t *NotificationTriggers) OnIncidentCreated(studentID uint, incidentType string, description string) {
	req := NotificationRequest{
		UserID:    studentID,
		EventType: "incident",
		Title:     "Ocorrência Registrada",
		Message:   fmt.Sprintf("Uma ocorrência do tipo '%s' foi registrada em seu nome: %s", incidentType, description),
		Priority:  PriorityMedium,
		ActionURL: "/student/incidents",
		Data: map[string]interface{}{
			"type": incidentType,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// === GATILHOS DE PESQUISAS ===

// OnSurveyAvailable dispara quando pesquisa está disponível
func (t *NotificationTriggers) OnSurveyAvailable(userID uint, surveyTitle string, deadline string) {
	req := NotificationRequest{
		UserID:    userID,
		EventType: "survey",
		Title:     "Pesquisa Disponível",
		Message:   fmt.Sprintf("A pesquisa '%s' está disponível para resposta até %s. Sua opinião é importante!", surveyTitle, deadline),
		Priority:  PriorityMedium,
		ActionURL: "/surveys",
		Data: map[string]interface{}{
			"surveyTitle": surveyTitle,
			"deadline":    deadline,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// OnSurveyReminder dispara lembrete 24h antes de fechar
func (t *NotificationTriggers) OnSurveyReminder(userID uint, surveyTitle string) {
	req := NotificationRequest{
		UserID:    userID,
		EventType: "survey_reminder",
		Title:     "Último Dia! Pesquisa",
		Message:   fmt.Sprintf("A pesquisa '%s' fecha amanhã! Não perca a chance de dar sua opinião.", surveyTitle),
		Priority:  PriorityHigh,
		ActionURL: "/surveys",
		ForceInApp: true,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	t.service.SendNotification(ctx, req)
}

// === JOB AGENDADO ===

// RunScheduledJobs executa jobs agendados (chamar de um cron)
func (t *NotificationTriggers) RunScheduledJobs() {
	// 1. Verificar aulas de amanhã e enviar lembretes
	t.sendClassReminders()

	// 2. Verificar pesquisas fechando em 24h
	t.sendSurveyReminders()

	// 3. Verificar frequências baixas
	t.checkLowAttendance()
}

func (t *NotificationTriggers) sendClassReminders() {
	tomorrow := time.Now().Add(24 * time.Hour).Format("2006-01-02")
	
	// Buscar aulas de amanhã
	// TODO: Implementar query real
	fmt.Printf("📅 Verificando aulas para %s...\n", tomorrow)
}

func (t *NotificationTriggers) sendSurveyReminders() {
	// Buscar pesquisas fechando em 24h
	// TODO: Implementar query real
	fmt.Println("📊 Verificando pesquisas fechando...")
}

func (t *NotificationTriggers) checkLowAttendance() {
	// Buscar alunos com frequência < 75%
	// TODO: Implementar query real
	fmt.Println("⚠️  Verificando frequências baixas...")
}
