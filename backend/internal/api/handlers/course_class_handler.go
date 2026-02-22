// backend/internal/api/handlers/course_class_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// CourseClassHandler gerencia turmas (CourseClass)
type CourseClassHandler struct {
	db *gorm.DB
}

// NewCourseClassHandler cria um novo handler
func NewCourseClassHandler(db *gorm.DB) *CourseClassHandler {
	return &CourseClassHandler{db: db}
}

// ListCourseClasses lista todas as turmas
// GET /api/v1/course-classes
func (h *CourseClassHandler) ListCourseClasses(w http.ResponseWriter, r *http.Request) {
	var classes []models.CourseClass
	
	query := h.db.Preload("Course").Preload("DefaultTeacher.User").Preload("DefaultLocation")
	
	// Filtros opcionais
	if courseID := r.URL.Query().Get("courseId"); courseID != "" {
		query = query.Where("course_id = ?", courseID)
	}
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	if err := query.Find(&classes).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classes)
}

// GetCourseClass obtém uma turma específica
// GET /api/v1/course-classes/:id
func (h *CourseClassHandler) GetCourseClass(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var class models.CourseClass
	if err := h.db.Preload("Course").
		Preload("DefaultTeacher.User").
		Preload("DefaultLocation").
		Preload("ClassSessions", func(db *gorm.DB) *gorm.DB {
			return db.Order("date DESC").Limit(10)
		}).
		First(&class, id).Error; err != nil {
		http.Error(w, "class not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(class)
}

// CreateCourseClass cria uma nova turma
// POST /api/v1/course-classes
func (h *CourseClassHandler) CreateCourseClass(w http.ResponseWriter, r *http.Request) {
	var req struct {
		CourseID           uint      `json:"courseId"`
		Code               string    `json:"code"`
		Name               string    `json:"name"`
		WeekDays           string    `json:"weekDays"`
		StartTime          string    `json:"startTime"`
		EndTime            string    `json:"endTime"`
		StartDate          time.Time `json:"startDate"`
		EndDate            time.Time `json:"endDate"`
		DefaultLocationID  *uint     `json:"defaultLocationId"`
		DefaultTeacherID   *uint     `json:"defaultTeacherId"`
		Capacity           int       `json:"capacity"`
		MaxStudents        int       `json:"maxStudents"`
		GoogleClassroomURL string    `json:"googleClassroomUrl"`
		GoogleClassroomID  string    `json:"googleClassroomId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validações
	if req.CourseID == 0 || req.Code == "" {
		http.Error(w, "courseId and code are required", http.StatusBadRequest)
		return
	}

	// Verificar se código já existe para este curso
	var existing models.CourseClass
	if err := h.db.Where("course_id = ? AND code = ?", req.CourseID, req.Code).
		First(&existing).Error; err == nil {
		http.Error(w, "class code already exists for this course", http.StatusConflict)
		return
	}

	class := models.CourseClass{
		CourseID:           req.CourseID,
		Code:               req.Code,
		Name:               req.Name,
		WeekDays:           req.WeekDays,
		StartTime:          req.StartTime,
		EndTime:            req.EndTime,
		StartDate:          req.StartDate,
		EndDate:            req.EndDate,
		DefaultLocationID:  req.DefaultLocationID,
		DefaultTeacherID:   req.DefaultTeacherID,
		Capacity:           req.Capacity,
		MaxStudents:        req.MaxStudents,
		GoogleClassroomURL: req.GoogleClassroomURL,
		GoogleClassroomID:  req.GoogleClassroomID,
		Status:             "active",
	}

	if err := h.db.Create(&class).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Carregar relações para resposta
	h.db.Preload("Course").Preload("DefaultTeacher.User").First(&class, class.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(class)
}

// UpdateCourseClass atualiza uma turma
// PUT /api/v1/course-classes/:id
func (h *CourseClassHandler) UpdateCourseClass(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var class models.CourseClass
	if err := h.db.First(&class, id).Error; err != nil {
		http.Error(w, "class not found", http.StatusNotFound)
		return
	}

	var req struct {
		Name               string    `json:"name"`
		WeekDays           string    `json:"weekDays"`
		StartTime          string    `json:"startTime"`
		EndTime            string    `json:"endTime"`
		StartDate          time.Time `json:"startDate"`
		EndDate            time.Time `json:"endDate"`
		DefaultLocationID  *uint     `json:"defaultLocationId"`
		DefaultTeacherID   *uint     `json:"defaultTeacherId"`
		Capacity           int       `json:"capacity"`
		MaxStudents        int       `json:"maxStudents"`
		GoogleClassroomURL string    `json:"googleClassroomUrl"`
		GoogleClassroomID  string    `json:"googleClassroomId"`
		Status             string    `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Atualizar campos
	updates := map[string]interface{}{
		"name":                 req.Name,
		"week_days":            req.WeekDays,
		"start_time":           req.StartTime,
		"end_time":             req.EndTime,
		"start_date":           req.StartDate,
		"end_date":             req.EndDate,
		"default_location_id":  req.DefaultLocationID,
		"default_teacher_id":   req.DefaultTeacherID,
		"capacity":             req.Capacity,
		"max_students":         req.MaxStudents,
		"google_classroom_url": req.GoogleClassroomURL,
		"google_classroom_id":  req.GoogleClassroomID,
		"status":               req.Status,
	}

	if err := h.db.Model(&class).Updates(updates).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.db.Preload("Course").Preload("DefaultTeacher.User").First(&class, id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(class)
}

// GetCourseClassStudents lista alunos de uma turma
// GET /api/v1/course-classes/:id/students
func (h *CourseClassHandler) GetCourseClassStudents(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var enrollments []models.EnrollmentCourseClass
	if err := h.db.Where("course_class_id = ?", id).
		Preload("Enrollment.Student.User").
		Find(&enrollments).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrollments)
}

// RegisterRoutes registra as rotas de turmas
func (h *CourseClassHandler) RegisterRoutes(r chi.Router) {
	r.Route("/course-classes", func(r chi.Router) {
		r.Get("/", h.ListCourseClasses)
		r.Post("/", h.CreateCourseClass)
		r.Get("/{id}", h.GetCourseClass)
		r.Put("/{id}", h.UpdateCourseClass)
		r.Get("/{id}/students", h.GetCourseClassStudents)
	})
}
