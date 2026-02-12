package repository

import (
	"context"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

type AttendanceRepository interface {
	Create(ctx context.Context, attendance *models.Attendance) error
	FindByID(ctx context.Context, id uint) (*models.Attendance, error)
	ListByCourseAndDate(ctx context.Context, courseID uint, date time.Time) ([]models.Attendance, error)
	ListByStudent(ctx context.Context, studentID uint) ([]models.Attendance, error)
	Update(ctx context.Context, attendance *models.Attendance) error
	Delete(ctx context.Context, id uint) error
}
