package students

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// Service defines the interface for student business logic operations
type Service interface {
	// GetStudents returns a list of students with pagination and filters
	GetStudents(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]models.Student, int64, error)

	// GetStudentByID returns a student by ID
	GetStudentByID(ctx context.Context, id uint) (*models.Student, error)

	// GetStudentByEmail returns a student by email
	GetStudentByEmail(ctx context.Context, email string) (*models.Student, error)

	// GetStudentByCPF returns a student by CPF
	GetStudentByCPF(ctx context.Context, cpf string) (*models.Student, error)

	// CreateStudent creates a new student
	CreateStudent(ctx context.Context, student *models.Student) error

	// UpdateStudent updates an existing student
	UpdateStudent(ctx context.Context, student *models.Student) error

	// DeleteStudent removes a student
	DeleteStudent(ctx context.Context, id uint) error

	// GetGuardians returns a student's guardians
	GetGuardians(ctx context.Context, studentID uint) ([]models.Guardian, error)

	// AddGuardian adds a guardian to a student
	AddGuardian(ctx context.Context, guardian *models.Guardian) error

	// UpdateGuardian updates a guardian
	UpdateGuardian(ctx context.Context, guardian *models.Guardian) error

	// RemoveGuardian removes a guardian
	RemoveGuardian(ctx context.Context, guardianID uint) error

	// GetDocuments returns a student's documents
	GetDocuments(ctx context.Context, studentID uint) ([]models.Document, error)

	// AddDocument adds a document to a student
	AddDocument(ctx context.Context, document *models.Document) error

	// RemoveDocument removes a document
	RemoveDocument(ctx context.Context, documentID uint) error

	// AddNote adds a note to a student
	AddNote(ctx context.Context, note *models.StudentNote) error

	// GetNotes returns a student's notes
	GetNotes(ctx context.Context, studentID uint, includeConfidential bool) ([]models.StudentNote, error)
}
