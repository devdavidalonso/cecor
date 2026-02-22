package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/interviews"
	"github.com/go-chi/chi/v5"
)

// InterviewAdminHandler gerencia formulários de entrevista (Admin only)
type InterviewAdminHandler struct {
	service interviews.AdminService
}

// NewInterviewAdminHandler cria um novo handler admin
func NewInterviewAdminHandler(service interviews.AdminService) *InterviewAdminHandler {
	return &InterviewAdminHandler{service: service}
}

// ==================== FORM DEFINITIONS ====================

// ListForms retorna todos os formulários
// GET /api/v1/admin/interview-forms
func (h *InterviewAdminHandler) ListForms(w http.ResponseWriter, r *http.Request) {
	forms, err := h.service.ListForms(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(forms)
}

// GetForm retorna um formulário específico
// GET /api/v1/admin/interview-forms/{id}
func (h *InterviewAdminHandler) GetForm(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "form ID is required", http.StatusBadRequest)
		return
	}

	form, err := h.service.GetForm(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if form == nil {
		http.Error(w, "form not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(form)
}

// CreateForm cria um novo formulário
// POST /api/v1/admin/interview-forms
func (h *InterviewAdminHandler) CreateForm(w http.ResponseWriter, r *http.Request) {
	var form models.FormDefinition
	if err := json.NewDecoder(r.Body).Decode(&form); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateForm(r.Context(), &form); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(form)
}

// UpdateForm atualiza um formulário existente
// PUT /api/v1/admin/interview-forms/{id}
func (h *InterviewAdminHandler) UpdateForm(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "form ID is required", http.StatusBadRequest)
		return
	}

	var form models.FormDefinition
	if err := json.NewDecoder(r.Body).Decode(&form); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateForm(r.Context(), id, &form); err != nil {
		if err.Error() == "form not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "form updated successfully"})
}

// DeleteForm remove um formulário
// DELETE /api/v1/admin/interview-forms/{id}
func (h *InterviewAdminHandler) DeleteForm(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "form ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteForm(r.Context(), id); err != nil {
		if err.Error() == "form not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ActivateForm ativa um formulário
// PATCH /api/v1/admin/interview-forms/{id}/activate
func (h *InterviewAdminHandler) ActivateForm(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "form ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.ActivateForm(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "form activated successfully"})
}

// DeactivateForm desativa um formulário
// PATCH /api/v1/admin/interview-forms/{id}/deactivate
func (h *InterviewAdminHandler) DeactivateForm(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "form ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeactivateForm(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "form deactivated successfully"})
}

// GetFormResponses retorna todas as respostas de um formulário
// GET /api/v1/admin/interview-forms/{version}/responses
func (h *InterviewAdminHandler) GetFormResponses(w http.ResponseWriter, r *http.Request) {
	version := chi.URLParam(r, "version")
	if version == "" {
		http.Error(w, "form version is required", http.StatusBadRequest)
		return
	}

	responses, err := h.service.GetFormResponses(r.Context(), version)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// RegisterAdminRoutes registra as rotas de administração
// Nota: As rotas são prefixadas com /api/v1/admin no main.go
func (h *InterviewAdminHandler) RegisterAdminRoutes(r chi.Router) {
	r.Get("/interview-forms", h.ListForms)
	r.Post("/interview-forms", h.CreateForm)
	r.Get("/interview-forms/{id}", h.GetForm)
	r.Put("/interview-forms/{id}", h.UpdateForm)
	r.Delete("/interview-forms/{id}", h.DeleteForm)
	r.Patch("/interview-forms/{id}/activate", h.ActivateForm)
	r.Patch("/interview-forms/{id}/deactivate", h.DeactivateForm)
	r.Get("/interview-forms/{version}/responses", h.GetFormResponses)
}
