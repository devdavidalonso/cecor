package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/interviews"
	"github.com/go-chi/chi/v5"
)

// InterviewHandler gerencia entrevistas dos alunos
type InterviewHandler struct {
	service interviews.Service
}

// NewInterviewHandler cria um novo handler
func NewInterviewHandler(service interviews.Service) *InterviewHandler {
	return &InterviewHandler{service: service}
}

// GetPending checks if the authenticated student has a pending interview
// GET /api/v1/interviews/pending?studentId=123
func (h *InterviewHandler) GetPending(w http.ResponseWriter, r *http.Request) {
	studentIDStr := r.URL.Query().Get("studentId")
	if studentIDStr == "" {
		http.Error(w, "studentId is required", http.StatusBadRequest)
		return
	}

	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		http.Error(w, "invalid studentId format", http.StatusBadRequest)
		return
	}

	form, err := h.service.GetPendingInterview(r.Context(), uint(studentID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if form == nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(form)
}

// SubmitResponse saves the interview answers
// POST /api/v1/interviews/response
func (h *InterviewHandler) SubmitResponse(w http.ResponseWriter, r *http.Request) {
	var response models.InterviewResponse
	if err := json.NewDecoder(r.Body).Decode(&response); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.SubmitResponse(r.Context(), &response); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "interview response saved successfully",
	})
}

// GetStudentInterview retorna a entrevista de um aluno específico
// GET /api/v1/interviews/student/{studentId}
func (h *InterviewHandler) GetStudentInterview(w http.ResponseWriter, r *http.Request) {
	studentIDStr := chi.URLParam(r, "studentId")
	if studentIDStr == "" {
		http.Error(w, "studentId is required", http.StatusBadRequest)
		return
	}

	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		http.Error(w, "invalid studentId format", http.StatusBadRequest)
		return
	}

	response, err := h.service.GetStudentInterview(r.Context(), uint(studentID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if response == nil {
		http.Error(w, "no interview found for this student", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CheckInterviewStatus verifica se um aluno precisa fazer entrevista
// GET /api/v1/interviews/check?studentId=123
func (h *InterviewHandler) CheckInterviewStatus(w http.ResponseWriter, r *http.Request) {
	studentIDStr := r.URL.Query().Get("studentId")
	if studentIDStr == "" {
		http.Error(w, "studentId is required", http.StatusBadRequest)
		return
	}

	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		http.Error(w, "invalid studentId format", http.StatusBadRequest)
		return
	}

	form, err := h.service.GetPendingInterview(r.Context(), uint(studentID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	status := map[string]interface{}{
		"hasPendingInterview": form != nil,
		"studentId":          studentID,
	}

	if form != nil {
		status["formId"] = form.ID
		status["formTitle"] = form.Title
		status["formVersion"] = form.Version
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

// RegisterRoutes registers the interview routes
func (h *InterviewHandler) RegisterRoutes(r chi.Router) {
	r.Get("/interviews/pending", h.GetPending)
	r.Post("/interviews/response", h.SubmitResponse)
	r.Get("/interviews/student/{studentId}", h.GetStudentInterview)
	r.Get("/interviews/check", h.CheckInterviewStatus)
}
