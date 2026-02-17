package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/teachers"
)

// TeacherHandler handles HTTP requests for teachers
type TeacherHandler struct {
	service teachers.Service
}

// NewTeacherHandler creates a new instance of TeacherHandler
func NewTeacherHandler(service teachers.Service) *TeacherHandler {
	return &TeacherHandler{
		service: service,
	}
}

// CreateProfessor handles the creation of a new professor
func (h *TeacherHandler) CreateProfessor(w http.ResponseWriter, r *http.Request) {
	var professor models.User
	if err := json.NewDecoder(r.Body).Decode(&professor); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateProfessor(r.Context(), &professor); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(professor)
}

// GetProfessors handles the retrieval of all professors
func (h *TeacherHandler) GetProfessors(w http.ResponseWriter, r *http.Request) {
	professors, err := h.service.GetProfessors(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(professors)
}

// GetProfessorByID handles the retrieval of a professor by ID
func (h *TeacherHandler) GetProfessorByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	professor, err := h.service.GetProfessorByID(r.Context(), uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(professor)
}

// UpdateProfessor handles the update of a professor
func (h *TeacherHandler) UpdateProfessor(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var professor models.User
	if err := json.NewDecoder(r.Body).Decode(&professor); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	professor.ID = uint(id)

	if err := h.service.UpdateProfessor(r.Context(), &professor); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(professor)
}

// DeleteProfessor handles the deletion of a professor
func (h *TeacherHandler) DeleteProfessor(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteProfessor(r.Context(), uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
