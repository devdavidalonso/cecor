// backend/internal/api/handlers/teacher_portal_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/devdavidalonso/cecor/backend/internal/service/teacherportal"
)

// TeacherPortalHandler handles teacher-specific endpoints
type TeacherPortalHandler struct {
	service teacherportal.Service
}

// NewTeacherPortalHandler creates a new handler
func NewTeacherPortalHandler(service teacherportal.Service) *TeacherPortalHandler {
	return &TeacherPortalHandler{service: service}
}

// GetDashboard returns teacher dashboard data
// GET /api/v1/teacher/dashboard
func (h *TeacherPortalHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	// Get teacher ID from context (set by auth middleware)
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	dashboard, err := h.service.GetDashboard(r.Context(), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dashboard)
}

// GetMyCourses returns courses taught by the teacher
// GET /api/v1/teacher/courses
func (h *TeacherPortalHandler) GetMyCourses(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	courses, err := h.service.GetTeacherCourses(r.Context(), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}

// GetCourseStudents returns students enrolled in a course
// GET /api/v1/teacher/courses/:id/students
func (h *TeacherPortalHandler) GetCourseStudents(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	courseID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}
	
	students, err := h.service.GetCourseStudents(r.Context(), uint(courseID), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(students)
}

// GetTodaySessions returns today's sessions for the teacher
// GET /api/v1/teacher/sessions/today
func (h *TeacherPortalHandler) GetTodaySessions(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	sessions, err := h.service.GetTodaySessions(r.Context(), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

// RecordAttendance records attendance for a session
// POST /api/v1/teacher/attendance/batch
func (h *TeacherPortalHandler) RecordAttendance(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	var records []teacherportal.AttendanceRecord
	if err := json.NewDecoder(r.Body).Decode(&records); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	
	if err := h.service.RecordAttendance(r.Context(), teacherID, records); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// CreateGoogleClassroom creates a Google Classroom for a course
// POST /api/v1/teacher/courses/:id/classroom/create
func (h *TeacherPortalHandler) CreateGoogleClassroom(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	courseID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}
	
	result, err := h.service.CreateGoogleClassroom(r.Context(), uint(courseID), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GetClassroomSyncStatus returns sync status for a course
// GET /api/v1/teacher/courses/:id/classroom/status
func (h *TeacherPortalHandler) GetClassroomSyncStatus(w http.ResponseWriter, r *http.Request) {
	courseID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}
	
	status, err := h.service.GetClassroomSyncStatus(r.Context(), uint(courseID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

// SyncStudentsWithClassroom syncs students with Google Classroom
// POST /api/v1/teacher/courses/:id/classroom/sync-students
func (h *TeacherPortalHandler) SyncStudentsWithClassroom(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	courseID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}
	
	results, err := h.service.SyncStudentsWithClassroom(r.Context(), uint(courseID), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// SendStudentInvitation sends invitation to a student
// POST /api/v1/teacher/courses/:id/students/:studentId/invite
func (h *TeacherPortalHandler) SendStudentInvitation(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	if teacherID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	courseID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}
	
	studentID, err := strconv.ParseUint(chi.URLParam(r, "studentId"), 10, 32)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}
	
	if err := h.service.SendStudentInvitation(r.Context(), uint(courseID), uint(studentID), teacherID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
}

// RegisterRoutes registers all teacher portal routes
func (h *TeacherPortalHandler) RegisterRoutes(r chi.Router) {
	r.Route("/teacher", func(r chi.Router) {
		// Dashboard
		r.Get("/dashboard", h.GetDashboard)
		r.Get("/sessions/today", h.GetTodaySessions)
		
		// Courses
		r.Get("/courses", h.GetMyCourses)
		r.Get("/courses/{id}/students", h.GetCourseStudents)
		
		// Attendance
		r.Post("/attendance/batch", h.RecordAttendance)
		
		// Google Classroom Integration
		r.Post("/courses/{id}/classroom/create", h.CreateGoogleClassroom)
		r.Get("/courses/{id}/classroom/status", h.GetClassroomSyncStatus)
		r.Post("/courses/{id}/classroom/sync-students", h.SyncStudentsWithClassroom)
		r.Post("/courses/{id}/students/{studentId}/invite", h.SendStudentInvitation)
	})
}
