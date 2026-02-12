package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/matriculas"
	"github.com/go-chi/chi/v5"
)

type EnrollmentHandler struct {
	service matriculas.Service
}

func NewEnrollmentHandler(service matriculas.Service) *EnrollmentHandler {
	return &EnrollmentHandler{service: service}
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

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(enrollment)
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
