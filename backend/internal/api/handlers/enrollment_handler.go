package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/enrollments"
	"github.com/devdavidalonso/cecor/backend/internal/service/interviews"
	"github.com/go-chi/chi/v5"
)

// EnrollmentResponse estende a resposta de matrícula com informações de entrevista
type EnrollmentResponse struct {
	*models.Enrollment
	InterviewRequired bool   `json:"interviewRequired"`
	InterviewFormID   string `json:"interviewFormId,omitempty"`
	InterviewFormTitle string `json:"interviewFormTitle,omitempty"`
	NextStep          string `json:"nextStep"`
	RedirectURL       string `json:"redirectUrl,omitempty"`
}

type EnrollmentHandler struct {
	service         enrollments.Service
	interviewService interviews.Service
}

func NewEnrollmentHandler(service enrollments.Service, interviewService interviews.Service) *EnrollmentHandler {
	return &EnrollmentHandler{
		service:         service,
		interviewService: interviewService,
	}
}

func (h *EnrollmentHandler) EnrollStudent(w http.ResponseWriter, r *http.Request) {
	var enrollment models.Enrollment
	if err := json.NewDecoder(r.Body).Decode(&enrollment); err != nil {
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}

	if err := h.service.EnrollStudent(r.Context(), &enrollment); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Verificar se existe entrevista pendente para o aluno
	form, err := h.interviewService.GetPendingInterview(r.Context(), enrollment.StudentID)
	if err != nil {
		// Log error but don't fail the enrollment
		fmt.Printf("Warning: Failed to check pending interview: %v\n", err)
	}

	// Construir resposta estendida
	response := EnrollmentResponse{
		Enrollment:        &enrollment,
		InterviewRequired: form != nil,
		NextStep:          "completed",
	}

	if form != nil {
		response.InterviewFormID = form.ID.Hex()
		response.InterviewFormTitle = form.Title
		response.NextStep = "interview_required"
		response.RedirectURL = fmt.Sprintf("/interviews/respond/%d", enrollment.StudentID)
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *EnrollmentHandler) GetEnrollment(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	enrollment, err := h.service.GetEnrollment(r.Context(), uint(id))
	if err != nil {
		http.Error(w, "Enrollment not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(enrollment)
}

func (h *EnrollmentHandler) ListEnrollments(w http.ResponseWriter, r *http.Request) {
	courseIDStr := r.URL.Query().Get("curso_id")

	var enrollments []models.Enrollment
	var err error

	if courseIDStr != "" {
		courseID, errConv := strconv.Atoi(courseIDStr)
		if errConv != nil {
			http.Error(w, "Invalid course ID", http.StatusBadRequest)
			return
		}
		enrollments, err = h.service.ListByCourse(r.Context(), uint(courseID))
	} else {
		enrollments, err = h.service.ListEnrollments(r.Context())
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(enrollments)
}

func (h *EnrollmentHandler) UpdateEnrollment(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var enrollment models.Enrollment
	if err := json.NewDecoder(r.Body).Decode(&enrollment); err != nil {
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}

	enrollment.ID = uint(id)
	if err := h.service.UpdateEnrollment(r.Context(), &enrollment); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(enrollment)
}

func (h *EnrollmentHandler) DeleteEnrollment(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteEnrollment(r.Context(), uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
