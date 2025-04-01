package students

import (
	"context"
	"fmt"
	"strings"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/repository"
)

// studentService implements the Service interface
type studentService struct {
	studentRepo repository.StudentRepository
	// You can add other repositories or services here if needed
}

// NewStudentService creates a new instance of studentService
func NewStudentService(studentRepo repository.StudentRepository) Service {
	return &studentService{
		studentRepo: studentRepo,
	}
}

// GetStudents returns a paginated list of students based on filters
func (s *studentService) GetStudents(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]models.Student, int64, error) {
	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20 // Default value
	}

	// Delegate to repository
	return s.studentRepo.FindAll(ctx, page, pageSize, filters)
}

// GetStudentByID returns a student by ID
func (s *studentService) GetStudentByID(ctx context.Context, id uint) (*models.Student, error) {
	if id == 0 {
		return nil, fmt.Errorf("invalid ID")
	}

	student, err := s.studentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("error finding student: %w", err)
	}

	if student == nil {
		return nil, fmt.Errorf("student not found")
	}

	return student, nil
}

// GetStudentByEmail returns a student by email
func (s *studentService) GetStudentByEmail(ctx context.Context, email string) (*models.Student, error) {
	if email == "" {
		return nil, fmt.Errorf("email not provided")
	}

	student, err := s.studentRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("error finding student by email: %w", err)
	}

	return student, nil // May return nil if not found
}

// GetStudentByCPF returns a student by CPF
func (s *studentService) GetStudentByCPF(ctx context.Context, cpf string) (*models.Student, error) {
	if cpf == "" {
		return nil, fmt.Errorf("CPF not provided")
	}

	// Remove CPF formatting
	cleanCPF := strings.ReplaceAll(strings.ReplaceAll(cpf, ".", ""), "-", "")

	// Basic CPF validation
	if len(cleanCPF) != 11 {
		return nil, fmt.Errorf("invalid CPF")
	}

	student, err := s.studentRepo.FindByCPF(ctx, cleanCPF)
	if err != nil {
		return nil, fmt.Errorf("error finding student by CPF: %w", err)
	}

	return student, nil // May return nil if not found
}

// CreateStudent creates a new student
func (s *studentService) CreateStudent(ctx context.Context, student *models.Student) error {
	// Validate required fields
	if student.User == (models.User{}) {
		return fmt.Errorf("user data is required")
	}

	if student.User.Name == "" {
		return fmt.Errorf("name is required")
	}

	if student.User.Email == "" {
		return fmt.Errorf("email is required")
	}

	if student.User.Phone == "" {
		return fmt.Errorf("phone is required")
	}

	// Validate birth date
	if student.User.BirthDate.IsZero() {
		return fmt.Errorf("birth date is required")
	}

	// Check if student already exists with the same email
	existingByEmail, err := s.studentRepo.FindByEmail(ctx, student.User.Email)
	if err != nil {
		return fmt.Errorf("error checking existing email: %w", err)
	}
	if existingByEmail != nil {
		return fmt.Errorf("a student with this email already exists")
	}

	// Check CPF if provided
	if student.User.CPF != "" {
		// Clean CPF
		student.User.CPF = strings.ReplaceAll(strings.ReplaceAll(student.User.CPF, ".", ""), "-", "")

		// Check if student already exists with the same CPF
		existingByCPF, err := s.studentRepo.FindByCPF(ctx, student.User.CPF)
		if err != nil {
			return fmt.Errorf("error checking existing CPF: %w", err)
		}
		if existingByCPF != nil {
			return fmt.Errorf("a student with this CPF already exists")
		}
	}

	// Set default status if not provided
	if student.Status == "" {
		student.Status = "active"
	}

	// Delegate to repository
	return s.studentRepo.Create(ctx, student)
}

// UpdateStudent updates an existing student
func (s *studentService) UpdateStudent(ctx context.Context, student *models.Student) error {
	if student.ID == 0 {
		return fmt.Errorf("student ID not provided")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, student.ID)
	if err != nil {
		return fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("student not found")
	}

	// Check email if being changed
	if student.User != (models.User{}) && student.User.Email != "" && student.User.Email != existing.User.Email {
		emailExisting, err := s.studentRepo.FindByEmail(ctx, student.User.Email)
		if err != nil {
			return fmt.Errorf("error checking existing email: %w", err)
		}
		if emailExisting != nil && emailExisting.ID != student.ID {
			return fmt.Errorf("another student with this email already exists")
		}
	}

	// Check CPF if being changed
	if student.User != (models.User{}) && student.User.CPF != "" && student.User.CPF != existing.User.CPF {
		// Clean CPF
		student.User.CPF = strings.ReplaceAll(strings.ReplaceAll(student.User.CPF, ".", ""), "-", "")

		cpfExisting, err := s.studentRepo.FindByCPF(ctx, student.User.CPF)
		if err != nil {
			return fmt.Errorf("error checking existing CPF: %w", err)
		}
		if cpfExisting != nil && cpfExisting.ID != student.ID {
			return fmt.Errorf("another student with this CPF already exists")
		}
	}

	// Delegate to repository
	return s.studentRepo.Update(ctx, student)
}

// DeleteStudent removes a student
func (s *studentService) DeleteStudent(ctx context.Context, id uint) error {
	if id == 0 {
		return fmt.Errorf("invalid ID")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("student not found")
	}

	// Delegate to repository
	return s.studentRepo.Delete(ctx, id)
}

// GetGuardians returns a student's guardians
func (s *studentService) GetGuardians(ctx context.Context, studentID uint) ([]models.Guardian, error) {
	if studentID == 0 {
		return nil, fmt.Errorf("invalid student ID")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return nil, fmt.Errorf("student not found")
	}

	// Delegate to repository
	return s.studentRepo.GetGuardians(ctx, studentID)
}

// AddGuardian adds a guardian to a student
func (s *studentService) AddGuardian(ctx context.Context, guardian *models.Guardian) error {
	if guardian.StudentID == 0 {
		return fmt.Errorf("student ID not provided")
	}

	if guardian.Name == "" {
		return fmt.Errorf("guardian name is required")
	}

	if guardian.Relationship == "" {
		return fmt.Errorf("relationship is required")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, guardian.StudentID)
	if err != nil {
		return fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("student not found")
	}

	// Check limit of guardians (maximum 3)
	guardians, err := s.studentRepo.GetGuardians(ctx, guardian.StudentID)
	if err != nil {
		return fmt.Errorf("error checking existing guardians: %w", err)
	}

	if len(guardians) >= 3 {
		return fmt.Errorf("maximum of 3 guardians per student reached")
	}

	// Delegate to repository
	return s.studentRepo.AddGuardian(ctx, guardian)
}

// UpdateGuardian updates a guardian
func (s *studentService) UpdateGuardian(ctx context.Context, guardian *models.Guardian) error {
	if guardian.ID == 0 {
		return fmt.Errorf("guardian ID not provided")
	}

	// Delegate to repository
	return s.studentRepo.UpdateGuardian(ctx, guardian)
}

// RemoveGuardian removes a guardian
func (s *studentService) RemoveGuardian(ctx context.Context, guardianID uint) error {
	if guardianID == 0 {
		return fmt.Errorf("invalid guardian ID")
	}

	// Delegate to repository
	return s.studentRepo.RemoveGuardian(ctx, guardianID)
}

// GetDocuments returns a student's documents
func (s *studentService) GetDocuments(ctx context.Context, studentID uint) ([]models.Document, error) {
	if studentID == 0 {
		return nil, fmt.Errorf("invalid student ID")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return nil, fmt.Errorf("student not found")
	}

	// Delegate to repository
	return s.studentRepo.GetDocuments(ctx, studentID)
}

// AddDocument adds a document to a student
func (s *studentService) AddDocument(ctx context.Context, document *models.Document) error {
	if document.StudentID == 0 {
		return fmt.Errorf("student ID not provided")
	}

	if document.Name == "" {
		return fmt.Errorf("document name is required")
	}

	if document.Type == "" {
		return fmt.Errorf("document type is required")
	}

	if document.Path == "" {
		return fmt.Errorf("document path is required")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, document.StudentID)
	if err != nil {
		return fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("student not found")
	}

	// Get user ID from context for document.UploadedBy
	userID, ok := ctx.Value("user_id").(uint)
	if ok && document.UploadedByID == 0 {
		document.UploadedByID = userID
	}

	// Delegate to repository
	return s.studentRepo.AddDocument(ctx, document)
}

// RemoveDocument removes a document
func (s *studentService) RemoveDocument(ctx context.Context, documentID uint) error {
	if documentID == 0 {
		return fmt.Errorf("invalid document ID")
	}

	// Delegate to repository
	return s.studentRepo.RemoveDocument(ctx, documentID)
}

// AddNote adds a note to a student
func (s *studentService) AddNote(ctx context.Context, note *models.StudentNote) error {
	if note.StudentID == 0 {
		return fmt.Errorf("student ID not provided")
	}

	if note.Content == "" {
		return fmt.Errorf("note content is required")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, note.StudentID)
	if err != nil {
		return fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("student not found")
	}

	// Get user ID from context for note.AuthorID
	userID, ok := ctx.Value("user_id").(uint)
	if ok && note.AuthorID == 0 {
		note.AuthorID = userID
	}

	// Delegate to repository
	return s.studentRepo.AddNote(ctx, note)
}

// GetNotes returns a student's notes
func (s *studentService) GetNotes(ctx context.Context, studentID uint, includeConfidential bool) ([]models.StudentNote, error) {
	if studentID == 0 {
		return nil, fmt.Errorf("invalid student ID")
	}

	// Check if student exists
	existing, err := s.studentRepo.FindByID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("error checking student existence: %w", err)
	}
	if existing == nil {
		return nil, fmt.Errorf("student not found")
	}

	// Check if user has permission to see confidential notes
	if includeConfidential {
		// In a real scenario, you would check the user's role here
		userRole, ok := ctx.Value("user_role").(string)
		if !ok || (userRole != "admin" && userRole != "manager" && userRole != "teacher") {
			includeConfidential = false // Fall back to non-confidential if no permission
		}
	}

	// Delegate to repository
	return s.studentRepo.GetNotes(ctx, studentID, includeConfidential)
}
