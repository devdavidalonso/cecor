package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// NoteRepository implements database operations for Student Notes
type NoteRepository struct {
	db *gorm.DB
}

// NewNoteRepository creates a new instance of NoteRepository
func NewNoteRepository(db *gorm.DB) *NoteRepository {
	return &NoteRepository{db}
}

// FindAll returns all notes
func (r *NoteRepository) FindAll() ([]models.StudentNote, error) {
	var notes []models.StudentNote
	if err := r.db.Find(&notes).Error; err != nil {
		return nil, err
	}
	return notes, nil
}

// FindByID returns a note by ID
func (r *NoteRepository) FindByID(id int) (models.StudentNote, error) {
	var note models.StudentNote
	if err := r.db.First(&note, id).Error; err != nil {
		return note, err
	}
	return note, nil
}

// Create creates a new note
func (r *NoteRepository) Create(note *models.StudentNote) error {
	return r.db.Create(note).Error
}

// Update updates a note
func (r *NoteRepository) Update(note models.StudentNote) error {
	return r.db.Save(&note).Error
}

// Delete removes a note
func (r *NoteRepository) Delete(id int) error {
	return r.db.Delete(&models.StudentNote{}, id).Error
}

// FindByStudentID returns all notes for a student
// userID: ID of the user viewing the notes
// isAdmin: whether the user is an admin (can see confidential notes)
func (r *NoteRepository) FindByStudentID(studentID, userID int, isAdmin bool) ([]models.StudentNote, error) {
	query := r.db.Where("student_id = ?", studentID)

	// If not admin, only show non-confidential notes or notes created by this user
	if !isAdmin {
		query = query.Where("is_confidential = ? OR author_id = ?", false, userID)
	}

	var notes []models.StudentNote
	if err := query.Order("created_at DESC").Preload("Author").Find(&notes).Error; err != nil {
		return nil, err
	}
	return notes, nil
}
