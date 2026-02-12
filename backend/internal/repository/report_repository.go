package repository

import (
	"context"
	"time"
)

type CourseAttendanceStats struct {
	StudentID      uint
	StudentName    string
	TotalClasses   int64
	PresentCount   int64
	AbsentCount    int64
	AttendanceRate float64
}

type StudentAttendanceStats struct {
	CourseID       uint
	CourseName     string
	TotalClasses   int64
	PresentCount   int64
	AbsentCount    int64
	AttendanceRate float64
}

type ReportRepository interface {
	GetCourseAttendanceStats(ctx context.Context, courseID uint, startDate, endDate time.Time) ([]CourseAttendanceStats, error)
	GetStudentAttendanceStats(ctx context.Context, studentID uint, startDate, endDate time.Time) ([]StudentAttendanceStats, error)
}
