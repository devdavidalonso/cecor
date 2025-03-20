// internal/repositories/note_repository.go
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
func (r *NoteRepository) FindByID(id uint) (models.StudentNote, error) {
	var note models.StudentNote
	if err := r.db.First(&note, id).Error; err != nil {
		return note, err
	}
	return note, nil
}

// Create creates a new note
func (r *NoteRepository) Create(note *models.StudentNote) (models.StudentNote, error) {
	err := r.db.Create(note).Error
	return *note, err
}

// Update updates a note
func (r *NoteRepository) Update(note models.StudentNote) (models.StudentNote, error) {
	err := r.db.Save(&note).Error
	return note, err
}

// Delete removes a note
func (r *NoteRepository) Delete(id uint) error {
	return r.db.Delete(&models.StudentNote{}, id).Error
}

// FindByStudentID returns all notes for a student
// userID: ID of the user viewing the notes
// showAllNotes: whether the user can see all notes (including confidential ones)
func (r *NoteRepository) FindByStudentID(studentID, userID uint, showAllNotes bool) ([]models.StudentNote, error) {
	query := r.db.Where("student_id = ?", studentID)

	// If not admin, only show non-confidential notes or notes created by this user
	if !showAllNotes {
		query = query.Where("is_confidential = ? OR author_id = ?", false, userID)
	}

	var notes []models.StudentNote
	if err := query.Order("created_at DESC").Preload("Author").Find(&notes).Error; err != nil {
		return nil, err
	}
	return notes, nil
}

// GetDB returns the database instance
func (r *NoteRepository) GetDB() *gorm.DB {
	return r.db
}
