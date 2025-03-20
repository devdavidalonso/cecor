package repositories

import (
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// AttendanceRepository implements database operations for Attendances
type AttendanceRepository struct {
	db *gorm.DB
}

// NewAttendanceRepository creates a new instance of AttendanceRepository
func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db}
}

// FindAll returns all attendance records
func (r *AttendanceRepository) FindAll() ([]models.Attendance, error) {
	var attendances []models.Attendance
	if err := r.db.Find(&attendances).Error; err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByID returns an attendance record by ID
func (r *AttendanceRepository) FindByID(id uint) (models.Attendance, error) {
	var attendance models.Attendance
	if err := r.db.First(&attendance, id).Error; err != nil {
		return attendance, err
	}
	return attendance, nil
}

// Create creates a new attendance record
func (r *AttendanceRepository) Create(attendance models.Attendance) (models.Attendance, error) {
	if err := r.db.Create(&attendance).Error; err != nil {
		return attendance, err
	}
	return attendance, nil
}

// Update updates an attendance record
func (r *AttendanceRepository) Update(attendance models.Attendance) (models.Attendance, error) {
	if err := r.db.Save(&attendance).Error; err != nil {
		return attendance, err
	}
	return attendance, nil
}

// Delete removes an attendance record
func (r *AttendanceRepository) Delete(id uint) error {
	return r.db.Delete(&models.Attendance{}, id).Error
}

// FindByStudentAndCourse returns all attendance records for a student in a course
func (r *AttendanceRepository) FindByStudentAndCourse(studentID, courseID uint) ([]models.Attendance, error) {
	var attendances []models.Attendance
	if err := r.db.Where("student_id = ? AND course_id = ?", studentID, courseID).Find(&attendances).Error; err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByDateRange returns all attendance records within a date range
func (r *AttendanceRepository) FindByDateRange(courseID uint, startDate, endDate string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	if err := r.db.Where("course_id = ? AND date BETWEEN ? AND ?", courseID, startDate, endDate).Find(&attendances).Error; err != nil {
		return nil, err
	}
	return attendances, nil
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

// CountConsecutiveAbsences counts the number of consecutive absences for a student in a course
func (r *AttendanceRepository) CountConsecutiveAbsences(studentID, courseID uint) (int64, error) {
	var count int64
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
