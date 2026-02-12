package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/presencas"
	"github.com/go-chi/chi/v5"
)

type AttendanceHandler struct {
	service presencas.Service
}

func NewAttendanceHandler(service presencas.Service) *AttendanceHandler {
	return &AttendanceHandler{service: service}
}

func (h *AttendanceHandler) RecordBatch(w http.ResponseWriter, r *http.Request) {
	var attendances []models.Attendance
	if err := json.NewDecoder(r.Body).Decode(&attendances); err != nil {
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}

	if err := h.service.RecordBatchAttendance(r.Context(), attendances); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *AttendanceHandler) GetClassAttendance(w http.ResponseWriter, r *http.Request) {
	courseIDStr := chi.URLParam(r, "id")
	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	dateStr := chi.URLParam(r, "data")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		http.Error(w, "Invalid date format (use YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	attendances, err := h.service.ListByCourseAndDate(r.Context(), uint(courseID), date)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(attendances)
}

func (h *AttendanceHandler) GetStudentHistory(w http.ResponseWriter, r *http.Request) {
	studentIDStr := chi.URLParam(r, "id")
	studentID, err := strconv.Atoi(studentIDStr)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	attendances, err := h.service.ListByStudent(r.Context(), uint(studentID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(attendances)
}

func (h *AttendanceHandler) GetStudentPercentage(w http.ResponseWriter, r *http.Request) {
	studentIDStr := chi.URLParam(r, "id")
	studentID, err := strconv.Atoi(studentIDStr)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	courseIDStr := r.URL.Query().Get("curso_id")
	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	percentage, err := h.service.GetStudentAttendancePercentage(r.Context(), uint(studentID), uint(courseID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]float64{"percentage": percentage})
}
