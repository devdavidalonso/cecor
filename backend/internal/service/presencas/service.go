package presencas

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

type Service interface {
	RecordAttendance(ctx context.Context, attendance *models.Attendance) error
	RecordBatchAttendance(ctx context.Context, attendances []models.Attendance) error
	GetAttendance(ctx context.Context, id uint) (*models.Attendance, error)
	ListByCourseAndDate(ctx context.Context, courseID uint, date time.Time) ([]models.Attendance, error)
	ListByStudent(ctx context.Context, studentID uint) ([]models.Attendance, error)
	GetStudentAttendancePercentage(ctx context.Context, studentID, courseID uint) (float64, error)
	UpdateAttendance(ctx context.Context, attendance *models.Attendance) error
	DeleteAttendance(ctx context.Context, id uint) error
}

type service struct {
	repo repository.AttendanceRepository
}

func NewService(repo repository.AttendanceRepository) Service {
	return &service{repo: repo}
}

func (s *service) RecordAttendance(ctx context.Context, attendance *models.Attendance) error {
	// Set default date if zero
	if attendance.Date.IsZero() {
		attendance.Date = time.Now()
	}
	// Status validation could be added here
	return s.repo.Create(ctx, attendance)
}

func (s *service) RecordBatchAttendance(ctx context.Context, attendances []models.Attendance) error {
	for i := range attendances {
		if attendances[i].Date.IsZero() {
			attendances[i].Date = time.Now()
		}
		if err := s.repo.Create(ctx, &attendances[i]); err != nil {
			return err
		}
	}
	return nil
}

func (s *service) GetAttendance(ctx context.Context, id uint) (*models.Attendance, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *service) ListByCourseAndDate(ctx context.Context, courseID uint, date time.Time) ([]models.Attendance, error) {
	return s.repo.ListByCourseAndDate(ctx, courseID, date)
}

func (s *service) ListByStudent(ctx context.Context, studentID uint) ([]models.Attendance, error) {
	return s.repo.ListByStudent(ctx, studentID)
}

func (s *service) GetStudentAttendancePercentage(ctx context.Context, studentID, courseID uint) (float64, error) {
	attendances, err := s.repo.ListByStudent(ctx, studentID)
	if err != nil {
		return 0, err
	}

	var total, present int
	for _, a := range attendances {
		if a.CourseID == courseID {
			total++
			if a.Status == "present" {
				present++
			}
		}
	}

	if total == 0 {
		return 0, nil
	}

	return (float64(present) / float64(total)) * 100, nil
}

func (s *service) UpdateAttendance(ctx context.Context, attendance *models.Attendance) error {
	return s.repo.Update(ctx, attendance)
}

func (s *service) DeleteAttendance(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}
