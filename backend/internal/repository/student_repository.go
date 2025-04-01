package repository

import (
	"context"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// StudentRepository defines the interface for student data access operations
type StudentRepository interface {
	// FindAll returns all students with pagination and filters
	// Parameters:
	// - ctx: context for database operations
	// - page: page number (starting from 1)
	// - pageSize: number of items per page
	// - filters: map of filter criteria (name, email, cpf, status, min_age, max_age, course_id)
	// Returns:
	// - []models.Student: list of student records
	// - int64: total count of matching records (before pagination)
	// - error: any error encountered during the operation
	FindAll(ctx context.Context, page int, pageSize int, filters map[string]interface{}) ([]models.Student, int64, error)

	// FindByID finds a student by ID
	// Parameters:
	// - ctx: context for database operations
	// - id: student ID to find
	// Returns:
	// - *models.Student: pointer to student record (nil if not found)
	// - error: any error encountered during the operation
	FindByID(ctx context.Context, id uint) (*models.Student, error)

	// FindByEmail finds a student by email
	// Parameters:
	// - ctx: context for database operations
	// - email: email address to search for
	// Returns:
	// - *models.Student: pointer to student record (nil if not found)
	// - error: any error encountered during the operation
	FindByEmail(ctx context.Context, email string) (*models.Student, error)

	// FindByCPF finds a student by CPF (Brazilian tax ID)
	// Parameters:
	// - ctx: context for database operations
	// - cpf: CPF number (with or without formatting)
	// Returns:
	// - *models.Student: pointer to student record (nil if not found)
	// - error: any error encountered during the operation
	FindByCPF(ctx context.Context, cpf string) (*models.Student, error)

	// Create creates a new student and associated user
	// Parameters:
	// - ctx: context for database operations
	// - student: student data to create (must include User data)
	// Returns:
	// - error: any error encountered during the operation
	Create(ctx context.Context, student *models.Student) error

	// Update updates an existing student and user data
	// Parameters:
	// - ctx: context for database operations
	// - student: student data to update
	// Returns:
	// - error: any error encountered during the operation
	Update(ctx context.Context, student *models.Student) error

	// Delete performs a logical deletion of a student
	// Parameters:
	// - ctx: context for database operations
	// - id: student ID to delete
	// Returns:
	// - error: any error encountered during the operation
	Delete(ctx context.Context, id uint) error

	// GetGuardians returns a student's guardians
	// Parameters:
	// - ctx: context for database operations
	// - studentID: ID of the student whose guardians to fetch
	// Returns:
	// - []models.Guardian: list of guardian records
	// - error: any error encountered during the operation
	GetGuardians(ctx context.Context, studentID uint) ([]models.Guardian, error)

	// AddGuardian adds a guardian to a student
	// Parameters:
	// - ctx: context for database operations
	// - guardian: guardian data to add
	// Returns:
	// - error: any error encountered during the operation
	AddGuardian(ctx context.Context, guardian *models.Guardian) error

	// UpdateGuardian updates an existing guardian
	// Parameters:
	// - ctx: context for database operations
	// - guardian: guardian data to update
	// Returns:
	// - error: any error encountered during the operation
	UpdateGuardian(ctx context.Context, guardian *models.Guardian) error

	// RemoveGuardian performs a logical deletion of a guardian
	// Parameters:
	// - ctx: context for database operations
	// - guardianID: ID of the guardian to remove
	// Returns:
	// - error: any error encountered during the operation
	RemoveGuardian(ctx context.Context, guardianID uint) error

	// GetDocuments returns a student's documents
	// Parameters:
	// - ctx: context for database operations
	// - studentID: ID of the student whose documents to fetch
	// Returns:
	// - []models.Document: list of document records
	// - error: any error encountered during the operation
	GetDocuments(ctx context.Context, studentID uint) ([]models.Document, error)

	// AddDocument adds a document to a student
	// Parameters:
	// - ctx: context for database operations
	// - document: document data to add
	// Returns:
	// - error: any error encountered during the operation
	AddDocument(ctx context.Context, document *models.Document) error

	// RemoveDocument removes a document
	// Parameters:
	// - ctx: context for database operations
	// - documentID: ID of the document to remove
	// Returns:
	// - error: any error encountered during the operation
	RemoveDocument(ctx context.Context, documentID uint) error

	// AddNote adds a note/observation to a student
	// Parameters:
	// - ctx: context for database operations
	// - note: note data to add
	// Returns:
	// - error: any error encountered during the operation
	AddNote(ctx context.Context, note *models.StudentNote) error

	// GetNotes returns a student's notes/observations
	// Parameters:
	// - ctx: context for database operations
	// - studentID: ID of the student whose notes to fetch
	// - includeConfidential: whether to include confidential notes
	// Returns:
	// - []models.StudentNote: list of note records
	// - error: any error encountered during the operation
	GetNotes(ctx context.Context, studentID uint, includeConfidential bool) ([]models.StudentNote, error)
}
