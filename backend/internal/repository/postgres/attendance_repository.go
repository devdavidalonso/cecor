package postgres

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
	"gorm.io/gorm"
)

type attendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) repository.AttendanceRepository {
	return &attendanceRepository{db: db}
}

func (r *attendanceRepository) Create(ctx context.Context, attendance *models.Attendance) error {
	return r.db.WithContext(ctx).Create(attendance).Error
}

func (r *attendanceRepository) FindByID(ctx context.Context, id uint) (*models.Attendance, error) {
	var attendance models.Attendance
	if err := r.db.WithContext(ctx).First(&attendance, id).Error; err != nil {
		return nil, err
	}
	return &attendance, nil
}

func (r *attendanceRepository) ListByCourseAndDate(ctx context.Context, courseID uint, date time.Time) ([]models.Attendance, error) {
	var attendances []models.Attendance
	// Truncate time to date only for comparison if needed, or use a range
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	if err := r.db.WithContext(ctx).
		Where("course_id = ? AND date >= ? AND date < ?", courseID, startOfDay, endOfDay).
		Find(&attendances).Error; err != nil {
		return nil, err
	}
	return attendances, nil
}

func (r *attendanceRepository) ListByStudent(ctx context.Context, studentID uint) ([]models.Attendance, error) {
	var attendances []models.Attendance
	if err := r.db.WithContext(ctx).Where("student_id = ?", studentID).Find(&attendances).Error; err != nil {
		return nil, err
	}
	return attendances, nil
}

func (r *attendanceRepository) Update(ctx context.Context, attendance *models.Attendance) error {
	return r.db.WithContext(ctx).Save(attendance).Error
}

func (r *attendanceRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Attendance{}, id).Error
}
