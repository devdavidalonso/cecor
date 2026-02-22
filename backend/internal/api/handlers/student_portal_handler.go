// backend/internal/api/handlers/student_portal_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// StudentPortalHandler gerencia o portal do aluno
type StudentPortalHandler struct {
	db *gorm.DB
}

// NewStudentPortalHandler cria um novo handler
func NewStudentPortalHandler(db *gorm.DB) *StudentPortalHandler {
	return &StudentPortalHandler{db: db}
}

// StudentDashboardResponse - Resposta do dashboard do aluno
type StudentDashboardResponse struct {
	Student       StudentInfo       `json:"student"`
	TodaySessions []TodaySession    `json:"todaySessions"`
	Courses       []StudentCourse   `json:"courses"`
	Alerts        []StudentAlert    `json:"alerts"`
	Stats         StudentStats      `json:"stats"`
}

type StudentInfo struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Phone  string `json:"phone"`
	Avatar string `json:"avatar"`
}

type TodaySession struct {
	ID              uint      `json:"id"`
	CourseName      string    `json:"courseName"`
	CourseClassName string    `json:"courseClassName"`
	Location        string    `json:"location"`
	StartTime       string    `json:"startTime"`
	EndTime         string    `json:"endTime"`
	TeacherName     string    `json:"teacherName"`
	HasAttendance   bool      `json:"hasAttendance"`
}

type StudentCourse struct {
	ID                uint    `json:"id"`
	Name              string  `json:"name"`
	ClassCode         string  `json:"classCode"`
	TeacherName       string  `json:"teacherName"`
	Location          string  `json:"location"`
	Schedule          string  `json:"schedule"`
	AttendancePercent float64 `json:"attendancePercent"`
	TotalSessions     int     `json:"totalSessions"`
	AttendedSessions  int     `json:"attendedSessions"`
	Status            string  `json:"status"`
	NextSession       *string `json:"nextSession,omitempty"`
}

type StudentAlert struct {
	Type        string `json:"type"` // low_attendance, incident, info
	Title       string `json:"title"`
	Description string `json:"description"`
	ActionURL   string `json:"actionUrl"`
	Severity    string `json:"severity"` // low, medium, high
}

type StudentStats struct {
	TotalCourses      int     `json:"totalCourses"`
	AverageAttendance float64 `json:"averageAttendance"`
	TotalIncidents    int     `json:"totalIncidents"`
}

// GetDashboard retorna o dashboard do aluno logado
// GET /api/v1/student/dashboard
func (h *StudentPortalHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Buscar student pelo user_id
	var student models.Student
	if err := h.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	// Buscar informações do usuário
	var user models.User
	h.db.First(&user, userID)

	// Buscar matrículas ativas do aluno
	var enrollments []models.Enrollment
	h.db.Where("student_id = ? AND status IN (?)", student.ID, []string{"active", "in_progress"}).
		Find(&enrollments)

	// Buscar aulas de hoje
	today := time.Now().Format("2006-01-02")
	var todaySessions []TodaySession
	
	for _, enrollment := range enrollments {
		var sessions []models.ClassSession
		h.db.Joins("JOIN courses ON courses.id = class_sessions.course_id").
			Where("class_sessions.course_id = ? AND DATE(class_sessions.date) = ?", 
				enrollment.CourseID, today).
			Find(&sessions)

		for _, session := range sessions {
			// Verificar se já tem presença registrada
			var attendance models.Attendance
			hasAttendance := h.db.Where("student_id = ? AND course_id = ? AND DATE(date) = ?",
				student.ID, enrollment.CourseID, today).First(&attendance).Error == nil

			// Buscar informações da sessão
			var location models.Location
			locationName := ""
			if session.LocationID != nil {
				h.db.First(&location, *session.LocationID)
				locationName = location.Name
			}

			// Buscar curso
			var course models.Course
			courseName := "Curso"
			if err := h.db.First(&course, enrollment.CourseID).Error; err == nil {
				courseName = course.Name
			}
			
			todaySessions = append(todaySessions, TodaySession{
				ID:              session.ID,
				CourseName:      courseName,
				CourseClassName: courseName, // TODO: adaptar quando tiver CourseClass
				Location:        locationName,
				StartTime:       session.Date.Format("15:04"),
				EndTime:         session.Date.Add(2 * time.Hour).Format("15:04"), // TODO: usar campo real
				HasAttendance:   hasAttendance,
			})
		}
	}

	// Calcular estatísticas e montar cursos
	var courses []StudentCourse
	var totalAttendance float64
	var alerts []StudentAlert

	for _, enrollment := range enrollments {
		// Calcular frequência
		var totalClasses int64
		var attendedClasses int64

		h.db.Model(&models.ClassSession{}).
			Where("course_id = ? AND date <= ?", enrollment.CourseID, time.Now()).
			Count(&totalClasses)

		h.db.Model(&models.Attendance{}).
			Where("student_id = ? AND course_id = ? AND status = ?", 
				student.ID, enrollment.CourseID, "present").
			Count(&attendedClasses)

		attendancePercent := 0.0
		if totalClasses > 0 {
			attendancePercent = float64(attendedClasses) / float64(totalClasses) * 100
		}
		totalAttendance += attendancePercent

		// Buscar próxima aula
		var nextSession models.ClassSession
		var nextSessionStr *string
		if err := h.db.Where("course_id = ? AND date > ?", 
			enrollment.CourseID, time.Now()).
			Order("date ASC").First(&nextSession).Error; err == nil {
			s := nextSession.Date.Format("02/01/2006 15:04")
			nextSessionStr = &s
		}

		// Buscar curso
		var course models.Course
		courseName := "Curso"
		courseSchedule := ""
		if err := h.db.First(&course, enrollment.CourseID).Error; err == nil {
			courseName = course.Name
			courseSchedule = course.Schedule
		}
		
		courses = append(courses, StudentCourse{
			ID:                enrollment.CourseID,
			Name:              courseName,
			ClassCode:         "2026A", // TODO: adaptar quando tiver CourseClass
			TeacherName:       "Professor", // TODO: buscar professor real
			Location:          "Sala",      // TODO: buscar location real
			Schedule:          courseSchedule,
			AttendancePercent: attendancePercent,
			TotalSessions:     int(totalClasses),
			AttendedSessions:  int(attendedClasses),
			Status:            enrollment.Status,
			NextSession:       nextSessionStr,
		})

		// Alerta de frequência baixa
		if attendancePercent < 75 {
			alerts = append(alerts, StudentAlert{
				Type:        "low_attendance",
				Title:       "Frequência Baixa",
				Description: fmt.Sprintf("Sua frequência em %s está em %.0f%% (mínimo: 75%%)", 
					courseName, attendancePercent),
				ActionURL:   fmt.Sprintf("/student/courses/%d/attendance", enrollment.CourseID),
				Severity:    "high",
			})
		}
	}

	// Calcular média de frequência
	averageAttendance := 0.0
	if len(enrollments) > 0 {
		averageAttendance = totalAttendance / float64(len(enrollments))
	}

	// Buscar ocorrências
	var incidentCount int64
	h.db.Model(&models.Incident{}).Where("student_id = ?", student.ID).Count(&incidentCount)

	response := StudentDashboardResponse{
		Student: StudentInfo{
			ID:     student.ID,
			Name:   user.Name,
			Email:  user.Email,
			Phone:  user.Phone,
			Avatar: "", // TODO: implementar avatar
		},
		TodaySessions: todaySessions,
		Courses:       courses,
		Alerts:        alerts,
		Stats: StudentStats{
			TotalCourses:      len(enrollments),
			AverageAttendance: averageAttendance,
			TotalIncidents:    int(incidentCount),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetMyCourses retorna os cursos do aluno
// GET /api/v1/student/courses
func (h *StudentPortalHandler) GetMyCourses(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var student models.Student
	if err := h.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	var enrollments []models.Enrollment
	h.db.Where("student_id = ? AND status IN (?)", student.ID, []string{"active", "in_progress"}).
		Preload("Course").
		Find(&enrollments)

	var courses []StudentCourse
	for _, enrollment := range enrollments {
		// Calcular frequência
		var totalClasses int64
		var attendedClasses int64

		h.db.Model(&models.ClassSession{}).
			Where("course_id = ? AND date <= ?", enrollment.CourseID, time.Now()).
			Count(&totalClasses)

		h.db.Model(&models.Attendance{}).
			Where("student_id = ? AND course_id = ? AND status = ?", 
				student.ID, enrollment.CourseID, "present").
			Count(&attendedClasses)

		attendancePercent := 0.0
		if totalClasses > 0 {
			attendancePercent = float64(attendedClasses) / float64(totalClasses) * 100
		}

		// Buscar curso
		var courseInfo models.Course
		courseName := "Curso"
		courseSchedule := ""
		if err := h.db.First(&courseInfo, enrollment.CourseID).Error; err == nil {
			courseName = courseInfo.Name
			courseSchedule = courseInfo.Schedule
		}
		
		courses = append(courses, StudentCourse{
			ID:                enrollment.CourseID,
			Name:              courseName,
			ClassCode:         "2026A",
			TeacherName:       "Professor",
			Location:          "Sala",
			Schedule:          courseSchedule,
			AttendancePercent: attendancePercent,
			TotalSessions:     int(totalClasses),
			AttendedSessions:  int(attendedClasses),
			Status:            enrollment.Status,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}

// GetCourseAttendance retorna o histórico de frequência de um curso
// GET /api/v1/student/courses/:id/attendance
func (h *StudentPortalHandler) GetCourseAttendance(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	courseID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid course id", http.StatusBadRequest)
		return
	}

	var student models.Student
	if err := h.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	// Verificar se está matriculado
	var enrollment models.Enrollment
	if err := h.db.Where("student_id = ? AND course_id = ?", student.ID, courseID).First(&enrollment).Error; err != nil {
		http.Error(w, "not enrolled in this course", http.StatusForbidden)
		return
	}

	// Buscar todas as sessões do curso
	var sessions []models.ClassSession
	h.db.Where("course_id = ?", courseID).Order("date DESC").Find(&sessions)

	type AttendanceRecord struct {
		Date      string `json:"date"`
		DayOfWeek string `json:"dayOfWeek"`
		Status    string `json:"status"` // present, absent, justified, not_recorded
		Topic     string `json:"topic"`
	}

	var records []AttendanceRecord
	var presentCount, absentCount, justifiedCount int

	for _, session := range sessions {
		var attendance models.Attendance
		err := h.db.Where("student_id = ? AND course_id = ? AND DATE(date) = DATE(?)",
			student.ID, courseID, session.Date).First(&attendance).Error

		status := "not_recorded"
		if err == nil {
			status = attendance.Status
			switch status {
			case "present":
				presentCount++
			case "absent":
				absentCount++
			case "justified":
				justifiedCount++
			}
		}

		records = append(records, AttendanceRecord{
			Date:      session.Date.Format("02/01/2006"),
			DayOfWeek: session.Date.Weekday().String(),
			Status:    status,
			Topic:     session.Topic,
		})
	}

	total := len(sessions)
	attendancePercent := 0.0
	if total > 0 {
		attendancePercent = float64(presentCount+justifiedCount) / float64(total) * 100
	}

	// Buscar curso
	var courseInfo2 models.Course
	courseName2 := "Curso"
	if err := h.db.First(&courseInfo2, courseID).Error; err == nil {
		courseName2 = courseInfo2.Name
	}

	response := struct {
		CourseName        string             `json:"courseName"`
		TotalSessions     int                `json:"totalSessions"`
		PresentCount      int                `json:"presentCount"`
		AbsentCount       int                `json:"absentCount"`
		JustifiedCount    int                `json:"justifiedCount"`
		AttendancePercent float64            `json:"attendancePercent"`
		Records           []AttendanceRecord `json:"records"`
	}{
		CourseName:        courseName2,
		TotalSessions:     total,
		PresentCount:      presentCount,
		AbsentCount:       absentCount,
		JustifiedCount:    justifiedCount,
		AttendancePercent: attendancePercent,
		Records:           records,
	}


	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetMyIncidents retorna as ocorrências do aluno
// GET /api/v1/student/incidents
func (h *StudentPortalHandler) GetMyIncidents(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var student models.Student
	if err := h.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	var incidents []models.Incident
	h.db.Where("student_id = ?", student.ID).
		Order("created_at DESC").
		Find(&incidents)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incidents)
}

// GetProfile retorna o perfil do aluno
// GET /api/v1/student/profile
func (h *StudentPortalHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var student models.Student
	if err := h.db.Where("user_id = ?", userID).
		Preload("User").
		Preload("User.Address").
		First(&student).Error; err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	birthDateStr := ""
	if !student.User.BirthDate.IsZero() {
		birthDateStr = student.User.BirthDate.Format("2006-01-02")
	}
	
	response := struct {
		ID            uint              `json:"id"`
		Name          string            `json:"name"`
		Email         string            `json:"email"`
		Phone         string            `json:"phone"`
		CPF           string            `json:"cpf"`
		BirthDate     string            `json:"birthDate"`
		Address       *models.Address   `json:"address,omitempty"`
		SpecialNeeds  string            `json:"specialNeeds"`
		MedicalInfo   string            `json:"medicalInfo"`
		CreatedAt     time.Time         `json:"createdAt"`
	}{
		ID:           student.ID,
		Name:         student.User.Name,
		Email:        student.User.Email,
		Phone:        student.User.Phone,
		CPF:          student.User.CPF,
		BirthDate:    birthDateStr,
		Address:      student.User.Address,
		SpecialNeeds: student.SpecialNeeds,
		MedicalInfo:  student.MedicalInfo,
		CreatedAt:    student.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateProfile atualiza dados do perfil (contato apenas)
// PUT /api/v1/student/profile
func (h *StudentPortalHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Phone string         `json:"phone"`
		Email string         `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Buscar student
	var student models.Student
	if err := h.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	// Atualizar apenas dados de contato do usuário
	updates := map[string]interface{}{
		"phone": req.Phone,
		"email": req.Email,
	}

	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		http.Error(w, "failed to update profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "profile updated successfully",
	})
}

// RegisterRoutes registra as rotas do portal do aluno
func (h *StudentPortalHandler) RegisterRoutes(r chi.Router) {
	r.Route("/student", func(r chi.Router) {
		r.Get("/dashboard", h.GetDashboard)
		r.Get("/courses", h.GetMyCourses)
		r.Get("/courses/{id}/attendance", h.GetCourseAttendance)
		r.Get("/incidents", h.GetMyIncidents)
		r.Get("/profile", h.GetProfile)
		r.Put("/profile", h.UpdateProfile)
	})
}


