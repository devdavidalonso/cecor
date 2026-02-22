package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/devdavidalonso/cecor/backend/internal/service/interviews"
	"github.com/go-chi/chi/v5"
)

// InterviewAnalyticsHandler fornece dados analíticos das entrevistas
type InterviewAnalyticsHandler struct {
	service interviews.Service
}

// NewInterviewAnalyticsHandler cria um novo handler
func NewInterviewAnalyticsHandler(service interviews.Service) *InterviewAnalyticsHandler {
	return &InterviewAnalyticsHandler{service: service}
}

// GetAnalyticsSummary retorna resumo estatístico das entrevistas
// GET /api/v1/admin/interview-analytics/summary
func (h *InterviewAnalyticsHandler) GetAnalyticsSummary(w http.ResponseWriter, r *http.Request) {
	// TODO: Implementar análises reais
	// Por enquanto, retornar dados de exemplo
	
	summary := map[string]interface{}{
		"totalResponses": 150,
		"completedCount": 145,
		"pendingCount":   5,
		"byFormVersion": map[string]int{
			"v1_2026": 150,
		},
		"recentActivity": []map[string]interface{}{
			{
				"date":  "2026-02-20",
				"count": 12,
			},
			{
				"date":  "2026-02-19",
				"count": 8,
			},
			{
				"date":  "2026-02-18",
				"count": 15,
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

// GetQuestionAnalytics retorna análise de uma pergunta específica
// GET /api/v1/admin/interview-analytics/questions/{questionId}
func (h *InterviewAnalyticsHandler) GetQuestionAnalytics(w http.ResponseWriter, r *http.Request) {
	questionID := chi.URLParam(r, "questionId")
	if questionID == "" {
		http.Error(w, "questionId is required", http.StatusBadRequest)
		return
	}

	// TODO: Implementar análise real por pergunta
	// Retornar estatísticas de exemplo baseadas no tipo de pergunta
	
	analytics := map[string]interface{}{
		"questionId": questionID,
		"questionLabel": "Você trabalha atualmente?",
		"type": "boolean",
		"totalResponses": 150,
		"breakdown": map[string]interface{}{
			"true": map[string]interface{}{
				"count": 45,
				"percentage": 30.0,
			},
			"false": map[string]interface{}{
				"count": 105,
				"percentage": 70.0,
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}

// GetAllResponses retorna todas as respostas para análise
// GET /api/v1/admin/interview-analytics/responses
func (h *InterviewAnalyticsHandler) GetAllResponses(w http.ResponseWriter, r *http.Request) {
	// TODO: Implementar paginação e filtros
	
	responses := []map[string]interface{}{
		{
			"id": "1",
			"studentId": 1,
			"studentName": "João da Silva",
			"formVersion": "v1_2026",
			"status": "completed",
			"completionDate": "2026-02-20T10:00:00Z",
			"answers": map[string]interface{}{
				"trabalha_atualmente": false,
				"escolaridade": "Médio Incompleto",
			},
		},
		{
			"id": "2",
			"studentId": 2,
			"studentName": "Maria Santos",
			"formVersion": "v1_2026",
			"status": "completed",
			"completionDate": "2026-02-20T11:30:00Z",
			"answers": map[string]interface{}{
				"trabalha_atualmente": true,
				"escolaridade": "Superior Completo",
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// RegisterRoutes registra as rotas de analytics
func (h *InterviewAnalyticsHandler) RegisterRoutes(r chi.Router) {
	r.Get("/admin/interview-analytics/summary", h.GetAnalyticsSummary)
	r.Get("/admin/interview-analytics/questions/{questionId}", h.GetQuestionAnalytics)
	r.Get("/admin/interview-analytics/responses", h.GetAllResponses)
}
