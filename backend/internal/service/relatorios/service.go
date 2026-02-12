package relatorios

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

type Service interface {
	GetCourseAttendanceStats(ctx context.Context, courseID uint, startDate, endDate time.Time) ([]repository.CourseAttendanceStats, error)
	GetStudentAttendanceStats(ctx context.Context, studentID uint, startDate, endDate time.Time) ([]repository.StudentAttendanceStats, error)
}

type service struct {
	repo repository.ReportRepository
}

func NewService(repo repository.ReportRepository) Service {
	return &service{repo: repo}
}

func (s *service) GetCourseAttendanceStats(ctx context.Context, courseID uint, startDate, endDate time.Time) ([]repository.CourseAttendanceStats, error) {
	return s.repo.GetCourseAttendanceStats(ctx, courseID, startDate, endDate)
}

func (s *service) GetStudentAttendanceStats(ctx context.Context, studentID uint, startDate, endDate time.Time) ([]repository.StudentAttendanceStats, error) {
	return s.repo.GetStudentAttendanceStats(ctx, studentID, startDate, endDate)
}
