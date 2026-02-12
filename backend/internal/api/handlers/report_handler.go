package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/service/relatorios"
	"github.com/go-chi/chi/v5"
)

type ReportHandler struct {
	service relatorios.Service
}

func NewReportHandler(service relatorios.Service) *ReportHandler {
	return &ReportHandler{service: service}
}

func (h *ReportHandler) GetCourseAttendanceReport(w http.ResponseWriter, r *http.Request) {
	courseIDStr := chi.URLParam(r, "id")
	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	var startDate, endDate time.Time

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			http.Error(w, "Invalid start date format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	} else {
		// Default to beginning of current year
		now := time.Now()
		startDate = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.Local)
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			http.Error(w, "Invalid end date format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	} else {
		// Default to today
		endDate = time.Now()
	}

	stats, err := h.service.GetCourseAttendanceStats(r.Context(), uint(courseID), startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(stats)
}

func (h *ReportHandler) GetStudentAttendanceReport(w http.ResponseWriter, r *http.Request) {
	studentIDStr := chi.URLParam(r, "id")
	studentID, err := strconv.Atoi(studentIDStr)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	var startDate, endDate time.Time

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			http.Error(w, "Invalid start date format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	} else {
		// Default to beginning of current year
		now := time.Now()
		startDate = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.Local)
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			http.Error(w, "Invalid end date format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	} else {
		// Default to today
		endDate = time.Now()
	}

	stats, err := h.service.GetStudentAttendanceStats(r.Context(), uint(studentID), startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(stats)
}
