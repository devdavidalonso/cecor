// internal/database/attendance_repository.go

package database

import (
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/jinzhu/gorm"
)

// AttendanceRepository implements database operations for Attendances
type AttendanceRepository struct {
	db *gorm.DB
}

// NewAttendanceRepository creates a new instance of AttendanceRepository
func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db}
}

// RegisterCourseAttendance registers attendance for all students in a course
func (r *AttendanceRepository) RegisterCourseAttendance(courseID uint, date time.Time, records []models.Attendance) error {
	// Start transaction
	tx := r.db.Begin()
	
	for _, attendance := range records {
		attendance.CourseID = courseID
		attendance.Date = date
		
		if err := tx.Create(&attendance).Error; err != nil {
			tx.Rollback()
			return err
		}
	}
	
	return tx.Commit().Error
}

// RegisterStudentAttendance registers attendance for a specific student
func (r *AttendanceRepository) RegisterStudentAttendance(attendance models.Attendance) error {
	return r.db.Create(&attendance).Error
}

// FindAttendancesByCourseDate finds all attendances for a course on a specific date
func (r *AttendanceRepository) FindAttendancesByCourseDate(courseID uint, date time.Time) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Where("course_id = ? AND date = ?", courseID, date).
		Preload("Student").
		Find(&attendances).Error
	return attendances, err
}

// FindStudentAttendances finds all attendances for a student in a course
func (r *AttendanceRepository) FindStudentAttendances(studentID, courseID uint) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Where("student_id = ? AND course_id = ?", studentID, courseID).
		Order("date DESC").
		Find(&attendances).Error
	return attendances, err
}

// UpdateAttendance updates an attendance record
func (r *AttendanceRepository) UpdateAttendance(attendance models.Attendance) error {
	return r.db.Save(&attendance).Error
}

// CountConsecutiveAbsences counts the number of consecutive absences for a student in a course
func (r *AttendanceRepository) CountConsecutiveAbsences(studentID, courseID uint) (int, error) {
	// Advanced implementation here...
	// This is pseudo-code that would need to be adapted to specific SQL
	var count int
	err := r.db.Raw(`
		WITH absences AS (
			SELECT date, 
				   ROW_NUMBER() OVER (ORDER BY date DESC) as row_num
			FROM attendances
			WHERE student_id = ? AND course_id = ? AND status = 'absent'
			ORDER BY date DESC
		)
		SELECT COUNT(*)
		FROM absences a1
		WHERE NOT EXISTS (
			SELECT 1 FROM attendances
			WHERE student_id = ? AND course_id = ? AND status <> 'absent'
			AND date > (SELECT date FROM absences WHERE row_num = a1.row_num + 1)
			AND date < a1.date
		)
	`, studentID, courseID, studentID, courseID).Count(&count).Error
	
	return count, err
}

// CreateAbsenceJustification creates a new absence justification
func (r *AttendanceRepository) CreateAbsenceJustification(justification models.AbsenceJustification) error {
	return r.db.Create(&justification).Error
}

// UpdateAbsenceJustification updates an absence justification
func (r *AttendanceRepository) UpdateAbsenceJustification(justification models.AbsenceJustification) error {
	return r.db.Save(&justification).Error
}

// FindPendingJustifications finds pending justifications
func (r *AttendanceRepository) FindPendingJustifications(courseID uint) ([]models.AbsenceJustification, error) {
	var justifications []models.AbsenceJustification
	query := r.db.Where("status = 'pending'")
	
	if courseID > 0 {
		query = query.Where("course_id = ?", courseID)
	}
	
	err := query.Preload("Student").
		Preload("Course").
		Preload("SubmittedBy").
		Find(&justifications).Error
	
	return justifications, err
}

// ProcessAbsenceAlerts automatically processes absence alerts
func (r *AttendanceRepository) ProcessAbsenceAlerts() error {
	// More complex implementation that would query recent absences
	// and generate alerts according to business rules
	
	// Pseudo-code to illustrate the logic
	return nil
}