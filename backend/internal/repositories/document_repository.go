// repositories/document_repository.go
package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// DocumentRepository implements database operations for Documents
type DocumentRepository struct {
	db *gorm.DB
}

// NewDocumentRepository creates a new instance of DocumentRepository
func NewDocumentRepository(db *gorm.DB) *DocumentRepository {
	return &DocumentRepository{db}
}

// FindAll returns all documents
func (r *DocumentRepository) FindAll() ([]models.Document, error) {
	var documents []models.Document
	if err := r.db.Find(&documents).Error; err != nil {
		return nil, err
	}
	return documents, nil
}

// FindByID returns a document by ID
func (r *DocumentRepository) FindByID(id uint) (models.Document, error) {
	var document models.Document
	if err := r.db.First(&document, id).Error; err != nil {
		return document, err
	}
	return document, nil
}

// Create creates a new document
func (r *DocumentRepository) Create(document *models.Document) error {
	return r.db.Create(document).Error
}

// Update updates a document
func (r *DocumentRepository) Update(document models.Document) error {
	return r.db.Save(&document).Error
}

// Delete removes a document
func (r *DocumentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Document{}, id).Error
}

// FindByStudentID returns all documents for a student
func (r *DocumentRepository) FindByStudentID(studentID uint) ([]models.Document, error) {
	var documents []models.Document
	if err := r.db.Where("student_id = ?", studentID).Find(&documents).Error; err != nil {
		return nil, err
	}
	return documents, nil
}
