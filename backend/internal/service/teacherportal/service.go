// backend/internal/service/teacherportal/service.go
package teacherportal

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// Service defines the interface for teacher portal operations
type Service interface {
	// Dashboard
	GetDashboard(ctx context.Context, teacherID uint) (*DashboardData, error)
	GetTodaySessions(ctx context.Context, teacherID uint) ([]SessionWithDetails, error)
	
	// Courses
	GetTeacherCourses(ctx context.Context, teacherID uint) ([]CourseWithStats, error)
	GetCourseStudents(ctx context.Context, courseID uint, teacherID uint) ([]StudentWithAttendance, error)
	
	// Attendance
	RecordAttendance(ctx context.Context, teacherID uint, records []AttendanceRecord) error
	GetSessionAttendance(ctx context.Context, sessionID uint, teacherID uint) ([]models.Attendance, error)
	
	// Google Classroom Integration
	CreateGoogleClassroom(ctx context.Context, courseID uint, teacherID uint) (*GoogleClassroomResult, error)
	GetClassroomSyncStatus(ctx context.Context, courseID uint) (*ClassroomSyncStatus, error)
	SyncStudentsWithClassroom(ctx context.Context, courseID uint, teacherID uint) ([]StudentSyncResult, error)
	SendStudentInvitation(ctx context.Context, courseID uint, studentID uint, teacherID uint) error
	
	// Validation
	IsTeacherOfCourse(ctx context.Context, teacherID uint, courseID uint) bool
}

// service implements the Service interface
type service struct {
	db *gorm.DB
}

// NewService creates a new teacher portal service
func NewService(db *gorm.DB) Service {
	return &service{db: db}
}

// DashboardData represents the teacher dashboard
type DashboardData struct {
	Teacher       TeacherInfo         `json:"teacher"`
	TodaySessions []SessionWithDetails `json:"todaySessions"`
	WeeklyStats   WeeklyStatistics    `json:"weeklyStats"`
	Alerts        []Alert             `json:"alerts"`
}

// TeacherInfo represents basic teacher information
type TeacherInfo struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// SessionWithDetails represents a class session with additional details
type SessionWithDetails struct {
	models.ClassSession
	CourseName         string `json:"courseName"`
	CourseID           uint   `json:"courseId"`
	LocationName       string `json:"locationName"`
	EnrolledCount      int64  `json:"enrolledCount"`
	AttendanceRecorded bool   `json:"attendanceRecorded"`
	StartTime          string `json:"startTime"`
	EndTime            string `json:"endTime"`
	GoogleClassroomID  string `json:"googleClassroomId,omitempty"`
	GoogleClassroomURL string `json:"googleClassroomUrl,omitempty"`
}

// WeeklyStatistics represents weekly stats for the teacher
type WeeklyStatistics struct {
	TotalStudents     int     `json:"totalStudents"`
	AverageAttendance float64 `json:"averageAttendance"`
	ClassesGiven      int     `json:"classesGiven"`
}

// Alert represents a dashboard alert
type Alert struct {
	Type        string `json:"type"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ActionURL   string `json:"actionUrl,omitempty"`
	Severity    string `json:"severity"`
}

// CourseWithStats represents a course with enrollment and attendance statistics
type CourseWithStats struct {
	models.Course
	EnrolledCount      int64   `json:"enrolledCount"`
	AverageAttendance  float64 `json:"averageAttendance"`
	Schedule           string  `json:"schedule,omitempty"`
	GoogleClassroomID  string  `json:"googleClassroomId,omitempty"`
	GoogleClassroomURL string  `json:"googleClassroomUrl,omitempty"`
	GoogleSyncStatus   string  `json:"googleSyncStatus"`
}

// StudentWithAttendance represents a student with their attendance info
type StudentWithAttendance struct {
	ID                     uint    `json:"id"`
	Name                   string  `json:"name"`
	Email                  string  `json:"email"`
	Phone                  string  `json:"phone,omitempty"`
	AttendancePercentage   float64 `json:"attendancePercentage"`
	Status                 string  `json:"status"`
	GoogleInvitationStatus string  `json:"googleInvitationStatus,omitempty"`
	EnrollmentID           uint    `json:"enrollmentId"`
}

// AttendanceRecord represents a single attendance record
type AttendanceRecord struct {
	StudentID    uint   `json:"studentId"`
	EnrollmentID uint   `json:"enrollmentId"`
	CourseID     uint   `json:"courseId"`
	Status       string `json:"status"`
	Note         string `json:"note,omitempty"`
}

// GoogleClassroomResult represents the result of creating a Google Classroom
type GoogleClassroomResult struct {
	Success            bool   `json:"success"`
	GoogleClassroomID  string `json:"googleClassroomId,omitempty"`
	GoogleClassroomURL string `json:"googleClassroomUrl,omitempty"`
	Message            string `json:"message,omitempty"`
	Error              string `json:"error,omitempty"`
}

// ClassroomSyncStatus represents the sync status for a course
type ClassroomSyncStatus struct {
	CourseID           uint       `json:"courseId"`
	Synced             bool       `json:"synced"`
	GoogleClassroomID  string     `json:"googleClassroomId,omitempty"`
	GoogleClassroomURL string     `json:"googleClassroomUrl,omitempty"`
	LastSyncAt         *time.Time `json:"lastSyncAt,omitempty"`
	Error              string     `json:"error,omitempty"`
}

// StudentSyncResult represents the result of syncing a student
type StudentSyncResult struct {
	StudentID      uint   `json:"studentId"`
	StudentName    string `json:"studentName"`
	Email          string `json:"email"`
	Success        bool   `json:"success"`
	InvitationSent bool   `json:"invitationSent"`
	Message        string `json:"message,omitempty"`
	Error          string `json:"error,omitempty"`
}

// GetDashboard returns the complete dashboard data for a teacher
func (s *service) GetDashboard(ctx context.Context, teacherID uint) (*DashboardData, error) {
	// Get teacher info
	var teacher models.User
	if err := s.db.WithContext(ctx).First(&teacher, teacherID).Error; err != nil {
		return nil, fmt.Errorf("teacher not found: %w", err)
	}

	dashboard := &DashboardData{
		Teacher: TeacherInfo{
			ID:    teacher.ID,
			Name:  teacher.Name,
			Email: teacher.Email,
		},
	}

	// Get today's sessions
	sessions, err := s.GetTodaySessions(ctx, teacherID)
	if err != nil {
		return nil, err
	}
	dashboard.TodaySessions = sessions

	// Get weekly stats
	stats, err := s.getWeeklyStats(ctx, teacherID)
	if err != nil {
		return nil, err
	}
	dashboard.WeeklyStats = *stats

	// Generate alerts
	alerts, err := s.generateAlerts(ctx, teacherID)
	if err != nil {
		return nil, err
	}
	dashboard.Alerts = alerts

	return dashboard, nil
}

// GetTodaySessions returns today's sessions for a teacher
func (s *service) GetTodaySessions(ctx context.Context, teacherID uint) ([]SessionWithDetails, error) {
	today := time.Now().Format("2006-01-02")
	
	var sessions []SessionWithDetails
	
	// Query for today's sessions with course info
	// Using teacher_courses table to find courses taught by teacher
	query := `
		SELECT 
			cs.id,
			cs.course_id,
			cs.date,
			cs.topic,
			cs.is_cancelled,
			c.name as course_name,
			l.name as location_name,
			c.google_classroom_id,
			c.google_classroom_url,
			c.start_time,
			c.end_time,
			(SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') as enrolled_count,
			EXISTS(SELECT 1 FROM attendances a WHERE a.class_session_id = cs.id LIMIT 1) as attendance_recorded
		FROM class_sessions cs
		INNER JOIN courses c ON cs.course_id = c.id
		INNER JOIN teacher_courses tc ON c.id = tc.course_id
		LEFT JOIN locations l ON cs.location_id = l.id
		WHERE tc.teacher_id = ?
			AND tc.active = true
			AND DATE(cs.date) = ?
			AND cs.is_cancelled = false
		ORDER BY c.start_time ASC
	`
	
	rows, err := s.db.WithContext(ctx).Raw(query, teacherID, today).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch today's sessions: %w", err)
	}
	defer rows.Close()
	
	for rows.Next() {
		var session SessionWithDetails
		var startTime, endTime string
		var locationName *string
		var googleClassroomID, googleClassroomURL *string
		
		err := rows.Scan(
			&session.ID,
			&session.CourseID,
			&session.Date,
			&session.Topic,
			&session.IsCancelled,
			&session.CourseName,
			&locationName,
			&googleClassroomID,
			&googleClassroomURL,
			&startTime,
			&endTime,
			&session.EnrolledCount,
			&session.AttendanceRecorded,
		)
		if err != nil {
			continue
		}
		
		if locationName != nil {
			session.LocationName = *locationName
		}
		if googleClassroomID != nil {
			session.GoogleClassroomID = *googleClassroomID
		}
		if googleClassroomURL != nil {
			session.GoogleClassroomURL = *googleClassroomURL
		}
		session.StartTime = startTime
		session.EndTime = endTime
		
		sessions = append(sessions, session)
	}
	
	return sessions, nil
}

// GetTeacherCourses returns all courses taught by a teacher with stats
func (s *service) GetTeacherCourses(ctx context.Context, teacherID uint) ([]CourseWithStats, error) {
	var courses []CourseWithStats
	
	query := `
		SELECT 
			c.id,
			c.name,
			c.short_description,
			c.workload,
			c.status,
			c.google_classroom_id,
			c.google_classroom_url,
			CASE 
				WHEN c.google_classroom_id IS NOT NULL AND c.google_classroom_id != '' THEN 'synced'
				ELSE 'not_synced'
			END as google_sync_status,
			c.schedule,
			(SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') as enrolled_count,
			COALESCE(
				(SELECT AVG(attendance_percentage) FROM (
					SELECT 
						e.student_id,
						(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as attendance_percentage
					FROM enrollments e
					LEFT JOIN attendances a ON e.student_id = a.student_id
					WHERE e.course_id = c.id
					GROUP BY e.student_id
				) subquery),
				0
			) as average_attendance
		FROM courses c
		INNER JOIN teacher_courses tc ON c.id = tc.course_id
		WHERE tc.teacher_id = ?
			AND tc.active = true
		ORDER BY c.name ASC
	`
	
	rows, err := s.db.WithContext(ctx).Raw(query, teacherID).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch teacher courses: %w", err)
	}
	defer rows.Close()
	
	for rows.Next() {
		var course CourseWithStats
		var description *string
		var googleClassroomID, googleClassroomURL, schedule *string
		
		err := rows.Scan(
			&course.ID,
			&course.Name,
			&description,
			&course.Workload,
			&course.Status,
			&googleClassroomID,
			&googleClassroomURL,
			&course.GoogleSyncStatus,
			&schedule,
			&course.EnrolledCount,
			&course.AverageAttendance,
		)
		if err != nil {
			continue
		}
		
		if description != nil {
			course.ShortDescription = *description
		}
		if googleClassroomID != nil {
			course.GoogleClassroomID = *googleClassroomID
		}
		if googleClassroomURL != nil {
			course.GoogleClassroomURL = *googleClassroomURL
		}
		if schedule != nil {
			course.Schedule = *schedule
		}
		
		courses = append(courses, course)
	}
	
	return courses, nil
}

// GetCourseStudents returns students enrolled in a course with attendance info
func (s *service) GetCourseStudents(ctx context.Context, courseID uint, teacherID uint) ([]StudentWithAttendance, error) {
	// Verify teacher has access to this course
	if !s.IsTeacherOfCourse(ctx, teacherID, courseID) {
		return nil, fmt.Errorf("access denied: teacher is not assigned to this course")
	}
	
	var students []StudentWithAttendance
	
	query := `
		SELECT 
			s.id,
			u.name,
			u.email,
			u.phone,
			s.status,
			e.id as enrollment_id,
			COALESCE(
				(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
				0
			) as attendance_percentage,
			COALESCE(e.google_invitation_status, 'not_sent') as google_invitation_status
		FROM enrollments e
		INNER JOIN students s ON e.student_id = s.id
		INNER JOIN users u ON s.user_id = u.id
		LEFT JOIN attendances a ON s.id = a.student_id
		WHERE e.course_id = ?
		GROUP BY s.id, u.name, u.email, u.phone, s.status, e.id, e.google_invitation_status
		ORDER BY u.name ASC
	`
	
	rows, err := s.db.WithContext(ctx).Raw(query, courseID).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch course students: %w", err)
	}
	defer rows.Close()
	
	for rows.Next() {
		var student StudentWithAttendance
		var phone *string
		
		err := rows.Scan(
			&student.ID,
			&student.Name,
			&student.Email,
			&phone,
			&student.Status,
			&student.EnrollmentID,
			&student.AttendancePercentage,
			&student.GoogleInvitationStatus,
		)
		if err != nil {
			continue
		}
		
		if phone != nil {
			student.Phone = *phone
		}
		
		students = append(students, student)
	}
	
	return students, nil
}

// RecordAttendance records attendance for a session
func (s *service) RecordAttendance(ctx context.Context, teacherID uint, records []AttendanceRecord) error {
	if len(records) == 0 {
		return fmt.Errorf("no attendance records provided")
	}
	
	// Insert attendance records
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, record := range records {
			attendance := models.Attendance{
				StudentID:      record.StudentID,
				EnrollmentID:   record.EnrollmentID,
				CourseID:       record.CourseID,
				Status:         record.Status,
				RegisteredByID: teacherID,
				Date:           time.Now(),
			}
			
			if err := tx.Create(&attendance).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// GetSessionAttendance returns attendance for a course
func (s *service) GetSessionAttendance(ctx context.Context, courseID uint, teacherID uint) ([]models.Attendance, error) {
	// Verify teacher has access
	if !s.IsTeacherOfCourse(ctx, teacherID, courseID) {
		return nil, fmt.Errorf("access denied or course not found")
	}
	
	var attendances []models.Attendance
	if err := s.db.WithContext(ctx).
		Where("course_id = ?", courseID).
		Find(&attendances).Error; err != nil {
		return nil, err
	}
	
	return attendances, nil
}

// IsTeacherOfCourse checks if a teacher is assigned to a course
func (s *service) IsTeacherOfCourse(ctx context.Context, teacherID uint, courseID uint) bool {
	var count int64
	s.db.WithContext(ctx).Model(&models.TeacherCourse{}).
		Where("course_id = ? AND teacher_id = ? AND active = true", courseID, teacherID).
		Count(&count)
	return count > 0
}

// getWeeklyStats calculates weekly statistics for a teacher
func (s *service) getWeeklyStats(ctx context.Context, teacherID uint) (*WeeklyStatistics, error) {
	stats := &WeeklyStatistics{}
	
	// Get total students
	var totalStudents int64
	s.db.WithContext(ctx).Model(&models.Enrollment{}).
		Joins("JOIN courses c ON enrollments.course_id = c.id").
		Joins("JOIN teacher_courses tc ON c.id = tc.course_id").
		Where("tc.teacher_id = ? AND tc.active = true AND enrollments.status = 'active'", teacherID).
		Count(&totalStudents)
	stats.TotalStudents = int(totalStudents)
	
	// Get classes given this week
	weekStart := time.Now().AddDate(0, 0, -7)
	var classesGiven int64
	s.db.WithContext(ctx).Model(&models.ClassSession{}).
		Joins("JOIN courses c ON class_sessions.course_id = c.id").
		Joins("JOIN teacher_courses tc ON c.id = tc.course_id").
		Where("tc.teacher_id = ? AND tc.active = true AND class_sessions.date >= ?", teacherID, weekStart).
		Count(&classesGiven)
	stats.ClassesGiven = int(classesGiven)
	
	// Get average attendance
	var avgAttendance float64
	s.db.WithContext(ctx).Raw(`
		SELECT COALESCE(AVG(percentage), 0)
		FROM (
			SELECT 
				(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as percentage
			FROM attendances a
			JOIN class_sessions cs ON a.class_session_id = cs.id
			JOIN courses c ON cs.course_id = c.id
			JOIN teacher_courses tc ON c.id = tc.course_id
			WHERE tc.teacher_id = ? AND tc.active = true
			GROUP BY cs.id
		) subquery
	`, teacherID).Scan(&avgAttendance)
	stats.AverageAttendance = avgAttendance
	
	return stats, nil
}

// generateAlerts generates dashboard alerts for a teacher
func (s *service) generateAlerts(ctx context.Context, teacherID uint) ([]Alert, error) {
	var alerts []Alert
	
	// Check for students with low attendance
	var lowAttendanceCount int64
	s.db.WithContext(ctx).Raw(`
		SELECT COUNT(DISTINCT student_id)
		FROM (
			SELECT 
				e.student_id,
				(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as percentage
			FROM enrollments e
			JOIN courses c ON e.course_id = c.id
			JOIN teacher_courses tc ON c.id = tc.course_id
			LEFT JOIN attendances a ON e.student_id = a.student_id
			WHERE tc.teacher_id = ? AND tc.active = true AND e.status = 'active'
			GROUP BY e.student_id
			HAVING (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) < 75
		) subquery
	`, teacherID).Scan(&lowAttendanceCount)
	
	if lowAttendanceCount > 0 {
		alerts = append(alerts, Alert{
			Type:        "low_attendance",
			Title:       "Alunos com baixa frequência",
			Description: fmt.Sprintf("%d aluno(s) estão com frequência abaixo de 75%%", lowAttendanceCount),
			ActionURL:   "/teacher/courses",
			Severity:    "high",
		})
	}
	
	// Check for courses not synced with Google Classroom
	var notSyncedCount int64
	s.db.WithContext(ctx).Model(&models.Course{}).
		Joins("JOIN teacher_courses tc ON courses.id = tc.course_id").
		Where("tc.teacher_id = ? AND tc.active = true AND (courses.google_classroom_id IS NULL OR courses.google_classroom_id = '')", teacherID).
		Count(&notSyncedCount)
	
	if notSyncedCount > 0 {
		alerts = append(alerts, Alert{
			Type:        "sync",
			Title:       "Turmas não sincronizadas",
			Description: fmt.Sprintf("%d turma(s) não estão sincronizadas com Google Classroom", notSyncedCount),
			ActionURL:   "/teacher/courses",
			Severity:    "medium",
		})
	}
	
	return alerts, nil
}

// CreateGoogleClassroom creates a Google Classroom for a course (placeholder)
func (s *service) CreateGoogleClassroom(ctx context.Context, courseID uint, teacherID uint) (*GoogleClassroomResult, error) {
	// Verify teacher has access
	if !s.IsTeacherOfCourse(ctx, teacherID, courseID) {
		return nil, fmt.Errorf("access denied")
	}
	
	// TODO: Implement actual Google Classroom API integration
	// For now, return mock success
	
	// Update course with mock Google Classroom data
	googleClassroomID := fmt.Sprintf("course_%d_%d", courseID, time.Now().Unix())
	googleClassroomURL := fmt.Sprintf("https://classroom.google.com/c/%s", googleClassroomID)
	
	if err := s.db.WithContext(ctx).Model(&models.Course{}).
		Where("id = ?", courseID).
		Updates(map[string]interface{}{
			"google_classroom_id":  googleClassroomID,
			"google_classroom_url": googleClassroomURL,
		}).Error; err != nil {
		return nil, fmt.Errorf("failed to update course: %w", err)
	}
	
	return &GoogleClassroomResult{
		Success:            true,
		GoogleClassroomID:  googleClassroomID,
		GoogleClassroomURL: googleClassroomURL,
		Message:            "Turma criada com sucesso no Google Classroom (modo simulação)",
	}, nil
}

// GetClassroomSyncStatus returns the sync status for a course
func (s *service) GetClassroomSyncStatus(ctx context.Context, courseID uint) (*ClassroomSyncStatus, error) {
	var course models.Course
	if err := s.db.WithContext(ctx).First(&course, courseID).Error; err != nil {
		return nil, fmt.Errorf("course not found: %w", err)
	}
	
	status := &ClassroomSyncStatus{
		CourseID: courseID,
		Synced:   course.GoogleClassroomID != "",
	}
	
	if course.GoogleClassroomID != "" {
		status.GoogleClassroomID = course.GoogleClassroomID
		status.GoogleClassroomURL = course.GoogleClassroomURL
		status.LastSyncAt = &course.UpdatedAt
	}
	
	return status, nil
}

// SyncStudentsWithClassroom syncs students with Google Classroom (placeholder)
func (s *service) SyncStudentsWithClassroom(ctx context.Context, courseID uint, teacherID uint) ([]StudentSyncResult, error) {
	// Verify teacher has access
	if !s.IsTeacherOfCourse(ctx, teacherID, courseID) {
		return nil, fmt.Errorf("access denied")
	}
	
	// Get students
	students, err := s.GetCourseStudents(ctx, courseID, teacherID)
	if err != nil {
		return nil, err
	}
	
	var results []StudentSyncResult
	
	// TODO: Implement actual Google Classroom API integration
	// For now, return mock results
	
	for _, student := range students {
		result := StudentSyncResult{
			StudentID:      student.ID,
			StudentName:    student.Name,
			Email:          student.Email,
			Success:        true,
			InvitationSent: true,
			Message:        "Convite enviado com sucesso (modo simulação)",
		}
		
		// Update enrollment status
		s.db.WithContext(ctx).Model(&models.Enrollment{}).
			Where("id = ?", student.EnrollmentID).
			Update("google_invitation_status", "pending")
		
		results = append(results, result)
	}
	
	return results, nil
}

// SendStudentInvitation sends an invitation to a student (placeholder)
func (s *service) SendStudentInvitation(ctx context.Context, courseID uint, studentID uint, teacherID uint) error {
	// Verify teacher has access
	if !s.IsTeacherOfCourse(ctx, teacherID, courseID) {
		return fmt.Errorf("access denied")
	}
	
	// TODO: Implement actual Google Classroom API integration
	
	// Update enrollment status
	return s.db.WithContext(ctx).Model(&models.Enrollment{}).
		Where("course_id = ? AND student_id = ?", courseID, studentID).
		Update("google_invitation_status", "pending").Error
}
