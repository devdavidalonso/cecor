package postgres

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/repository"
	"gorm.io/gorm"
)

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) repository.ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) GetCourseAttendanceStats(ctx context.Context, courseID uint, startDate, endDate time.Time) ([]repository.CourseAttendanceStats, error) {
	var stats []repository.CourseAttendanceStats

	err := r.db.Table("enrollments").
		Select(`
			enrollments.student_id,
			users.name as student_name,
			COUNT(attendances.id) as total_classes,
			SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END) as present_count,
			SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END) as absent_count
		`).
		Joins("JOIN students ON students.id = enrollments.student_id").
		Joins("JOIN users ON users.id = students.user_id").
		Joins("LEFT JOIN attendances ON attendances.student_id = students.user_id AND attendances.course_id = enrollments.course_id").
		Where("enrollments.course_id = ?", courseID).
		Where("attendances.date BETWEEN ? AND ?", startDate, endDate).
		Group("enrollments.student_id, users.name").
		Scan(&stats).Error

	if err != nil {
		return nil, err
	}

	for i := range stats {
		if stats[i].TotalClasses > 0 {
			stats[i].AttendanceRate = float64(stats[i].PresentCount) / float64(stats[i].TotalClasses) * 100
		}
	}

	return stats, nil
}

func (r *reportRepository) GetStudentAttendanceStats(ctx context.Context, studentID uint, startDate, endDate time.Time) ([]repository.StudentAttendanceStats, error) {
	var stats []repository.StudentAttendanceStats

	err := r.db.Table("enrollments").
		Select(`
			enrollments.course_id,
			courses.name as course_name,
			COUNT(attendances.id) as total_classes,
			SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END) as present_count,
			SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END) as absent_count
		`).
		Joins("JOIN courses ON courses.id = enrollments.course_id").
		Joins("JOIN students ON students.id = enrollments.student_id").
		Joins("LEFT JOIN attendances ON attendances.student_id = students.user_id AND attendances.course_id = enrollments.course_id").
		Where("enrollments.student_id = ?", studentID).
		Where("attendances.date BETWEEN ? AND ?", startDate, endDate).
		Group("enrollments.course_id, courses.name").
		Scan(&stats).Error

	if err != nil {
		return nil, err
	}

	for i := range stats {
		if stats[i].TotalClasses > 0 {
			stats[i].AttendanceRate = float64(stats[i].PresentCount) / float64(stats[i].TotalClasses) * 100
		}
	}

	return stats, nil
}
