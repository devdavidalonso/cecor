// internal/repositories/volunteer_term_repository.go

package repositories

import (
	"errors"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

var (
	ErrTemplateNotFound = errors.New("term template not found")
	ErrTermNotFound     = errors.New("volunteer term not found")
	ErrNoActiveTemplate = errors.New("no active term template found")
	ErrActiveTermExists = errors.New("teacher already has an active term")
)

// VolunteerTermRepository implements database operations for volunteer terms
type VolunteerTermRepository struct {
	db *gorm.DB
}

// NewVolunteerTermRepository creates a new instance of VolunteerTermRepository
func NewVolunteerTermRepository(db *gorm.DB) *VolunteerTermRepository {
	return &VolunteerTermRepository{db}
}

// CreateTermTemplate creates a new volunteer term template
func (r *VolunteerTermRepository) CreateTermTemplate(template *models.VolunteerTermTemplate) error {
	return r.db.Create(template).Error
}

// GetTermTemplateByID retrieves a template by its ID
func (r *VolunteerTermRepository) GetTermTemplateByID(templateID uint) (*models.VolunteerTermTemplate, error) {
	var template models.VolunteerTermTemplate
	if err := r.db.Where("id = ?", templateID).First(&template).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTemplateNotFound
		}
		return nil, err
	}
	return &template, nil
}

// UpdateTermTemplate updates an existing template
func (r *VolunteerTermRepository) UpdateTermTemplate(template *models.VolunteerTermTemplate) error {
	return r.db.Save(template).Error
}

// DeleteTermTemplate deletes a template
func (r *VolunteerTermRepository) DeleteTermTemplate(templateID uint) error {
	return r.db.Delete(&models.VolunteerTermTemplate{}, templateID).Error
}

// ListTermTemplates lists templates with pagination and filters
func (r *VolunteerTermRepository) ListTermTemplates(offset, limit int, filters map[string]interface{}) ([]models.VolunteerTermTemplate, int, error) {
	var templates []models.VolunteerTermTemplate
	var total int64

	query := r.db.Model(&models.VolunteerTermTemplate{})

	// Apply filters
	if title, ok := filters["title"].(string); ok && title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if version, ok := filters["version"].(string); ok && version != "" {
		query = query.Where("version = ?", version)
	}
	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where("is_active = ?", isActive)
	}

	// Count total matching records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&templates).Error; err != nil {
		return nil, 0, err
	}

	return templates, int(total), nil
}

// GetAllTermTemplates gets all term templates
func (r *VolunteerTermRepository) GetAllTermTemplates() ([]models.VolunteerTermTemplate, error) {
	var templates []models.VolunteerTermTemplate
	if err := r.db.Order("created_at DESC").Find(&templates).Error; err != nil {
		return nil, err
	}
	return templates, nil
}

// SetTemplateActiveStatus sets the active status of a template
func (r *VolunteerTermRepository) SetTemplateActiveStatus(templateID uint, active bool) error {
	return r.db.Model(&models.VolunteerTermTemplate{}).Where("id = ?", templateID).Update("is_active", active).Error
}

// DeactivateAllTemplates deactivates all templates (usually before activating a new one)
func (r *VolunteerTermRepository) DeactivateAllTemplates() error {
	return r.db.Model(&models.VolunteerTermTemplate{}).Update("is_active", false).Error
}

// GetActiveTermTemplate gets the currently active template
func (r *VolunteerTermRepository) GetActiveTermTemplate() (*models.VolunteerTermTemplate, error) {
	var template models.VolunteerTermTemplate
	if err := r.db.Where("is_active = ?", true).First(&template).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNoActiveTemplate
		}
		return nil, err
	}
	return &template, nil
}

// CountSignedTermsByTemplate counts how many signed terms use a specific template
func (r *VolunteerTermRepository) CountSignedTermsByTemplate(templateID uint) (int, error) {
	var count int64
	err := r.db.Model(&models.VolunteerTerm{}).Where("template_id = ?", templateID).Count(&count).Error
	return int(count), err
}

// HasSignedTermsForTemplate checks if there are any signed terms using this template
func (r *VolunteerTermRepository) HasSignedTermsForTemplate(templateID uint) (bool, error) {
	count, err := r.CountSignedTermsByTemplate(templateID)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// HasActiveTermForTeacher checks if a teacher already has an active term
func (r *VolunteerTermRepository) HasActiveTermForTeacher(teacherID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.VolunteerTerm{}).
		Where("teacher_id = ? AND status = ? AND expiration_date > ?", teacherID, "active", time.Now()).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// SignVolunteerTerm creates a signed volunteer term
func (r *VolunteerTermRepository) SignVolunteerTerm(term *models.VolunteerTerm) error {
	// Start transaction
	tx := r.db.Begin()

	// Create the term
	if err := tx.Create(term).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create initial history record
	history := models.VolunteerTermHistory{
		TermID:     term.ID,
		ActionType: "signed",
		ActionDate: term.SignedAt,
		ActionByID: &term.TeacherID,
		Details:    "Term signed by teacher",
		CreatedBy:  term.CreatedBy,
	}

	if err := tx.Create(&history).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// GetVolunteerTermByID retrieves a term by its ID with details
func (r *VolunteerTermRepository) GetVolunteerTermByID(termID uint) (*models.VolunteerTerm, error) {
	var term models.VolunteerTerm
	if err := r.db.Where("id = ?", termID).
		Preload("Teacher").
		Preload("Template").
		First(&term).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTermNotFound
		}
		return nil, err
	}
	return &term, nil
}

// UpdateVolunteerTerm updates an existing term
func (r *VolunteerTermRepository) UpdateVolunteerTerm(term *models.VolunteerTerm) error {
	return r.db.Save(term).Error
}

// GetVolunteerTermsByTeacherID gets all terms for a specific teacher
func (r *VolunteerTermRepository) GetVolunteerTermsByTeacherID(teacherID uint) ([]models.VolunteerTerm, error) {
	var terms []models.VolunteerTerm
	if err := r.db.Where("teacher_id = ?", teacherID).
		Preload("Template").
		Order("signed_at DESC").
		Find(&terms).Error; err != nil {
		return nil, err
	}
	return terms, nil
}

// GetAllVolunteerTerms gets all volunteer terms with optional status filter
func (r *VolunteerTermRepository) GetAllVolunteerTerms(statusFilter string) ([]models.VolunteerTerm, error) {
	var terms []models.VolunteerTerm
	query := r.db.Model(&models.VolunteerTerm{})

	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}

	if err := query.Preload("Teacher").
		Preload("Template").
		Order("signed_at DESC").
		Find(&terms).Error; err != nil {
		return nil, err
	}

	return terms, nil
}

// ListVolunteerTerms lists volunteer terms with pagination and filters
func (r *VolunteerTermRepository) ListVolunteerTerms(offset, limit int, filters map[string]interface{}) ([]models.VolunteerTerm, int, error) {
	var terms []models.VolunteerTerm
	var total int64

	query := r.db.Model(&models.VolunteerTerm{})

	// Apply filters
	if teacherID, ok := filters["teacher_id"].(uint); ok && teacherID > 0 {
		query = query.Where("teacher_id = ?", teacherID)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if signedAfter, ok := filters["signed_after"].(time.Time); ok && !signedAfter.IsZero() {
		query = query.Where("signed_at >= ?", signedAfter)
	}
	if signedBefore, ok := filters["signed_before"].(time.Time); ok && !signedBefore.IsZero() {
		query = query.Where("signed_at <= ?", signedBefore)
	}
	if expiresAfter, ok := filters["expires_after"].(time.Time); ok && !expiresAfter.IsZero() {
		query = query.Where("expiration_date >= ?", expiresAfter)
	}
	if expiresBefore, ok := filters["expires_before"].(time.Time); ok && !expiresBefore.IsZero() {
		query = query.Where("expiration_date <= ?", expiresBefore)
	}

	// Count total matching records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with preloads
	if err := query.Preload("Teacher").
		Preload("Template").
		Order("signed_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&terms).Error; err != nil {
		return nil, 0, err
	}

	return terms, int(total), nil
}

// GetExpiringTerms gets terms that will expire before the given date
func (r *VolunteerTermRepository) GetExpiringTerms(limitDate time.Time) ([]models.VolunteerTerm, error) {
	var terms []models.VolunteerTerm

	if err := r.db.Where("status = ? AND expiration_date <= ? AND expiration_date > ?",
		"active", limitDate, time.Now()).
		Preload("Teacher").
		Preload("Template").
		Order("expiration_date").
		Find(&terms).Error; err != nil {
		return nil, err
	}

	return terms, nil
}

// GetExpiringTermsWithoutReminder gets terms that will expire before the given date and haven't been reminded
func (r *VolunteerTermRepository) GetExpiringTermsWithoutReminder(limitDate time.Time) ([]models.VolunteerTerm, error) {
	var terms []models.VolunteerTerm

	if err := r.db.Where("status = ? AND expiration_date <= ? AND expiration_date > ? AND reminder_sent = ?",
		"active", limitDate, time.Now(), false).
		Preload("Teacher").
		Preload("Template").
		Order("expiration_date").
		Find(&terms).Error; err != nil {
		return nil, err
	}

	return terms, nil
}

// ListExpiringTerms lists terms that are about to expire
func (r *VolunteerTermRepository) ListExpiringTerms(daysThreshold int) ([]models.VolunteerTerm, error) {
	var terms []models.VolunteerTerm

	// Calculate the date threshold
	threshold := time.Now().AddDate(0, 0, daysThreshold)

	if err := r.db.Where("status = ? AND expiration_date <= ? AND expiration_date > ?", "active", threshold, time.Now()).
		Preload("Teacher").
		Preload("Template").
		Order("expiration_date").
		Find(&terms).Error; err != nil {
		return nil, err
	}

	return terms, nil
}

// MarkExpiringTermsAsReminded marks expiring terms as having been reminded
func (r *VolunteerTermRepository) MarkExpiringTermsAsReminded(daysThreshold int) (int, error) {
	// Calculate the date threshold
	threshold := time.Now().AddDate(0, 0, daysThreshold)

	// Update the reminder status
	result := r.db.Model(&models.VolunteerTerm{}).
		Where("status = ? AND expiration_date <= ? AND expiration_date > ? AND reminder_sent = ?",
			"active", threshold, time.Now(), false).
		Updates(map[string]interface{}{
			"reminder_sent": true,
		})

	if result.Error != nil {
		return 0, result.Error
	}

	return int(result.RowsAffected), nil
}

// ExpireTerms marks expired terms as expired
func (r *VolunteerTermRepository) ExpireTerms() (int, error) {
	// Start transaction
	tx := r.db.Begin()

	// Find terms that should be expired
	var termsToExpire []models.VolunteerTerm
	if err := tx.Where("status = ? AND expiration_date < ?", "active", time.Now()).
		Find(&termsToExpire).Error; err != nil {
		tx.Rollback()
		return 0, err
	}

	count := len(termsToExpire)

	// Update each term and add history record
	for _, term := range termsToExpire {
		// Update term status
		if err := tx.Model(&term).Update("status", "expired").Error; err != nil {
			tx.Rollback()
			return 0, err
		}

		// Add history record
		history := models.VolunteerTermHistory{
			TermID:     term.ID,
			ActionType: "expired",
			ActionDate: time.Now(),
			Details:    "Term automatically expired by system",
			CreatedBy:  term.CreatedBy,
		}

		if err := tx.Create(&history).Error; err != nil {
			tx.Rollback()
			return 0, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return 0, err
	}

	return count, nil
}

// RevokeTerms revokes specified terms
func (r *VolunteerTermRepository) RevokeTerms(termIDs []uint, reason string, revokedBy uint) error {
	// Start transaction
	tx := r.db.Begin()

	for _, termID := range termIDs {
		// Update term status
		if err := tx.Model(&models.VolunteerTerm{}).
			Where("id = ?", termID).
			Update("status", "revoked").Error; err != nil {
			tx.Rollback()
			return err
		}

		// Add history record
		history := models.VolunteerTermHistory{
			TermID:     termID,
			ActionType: "revoked",
			ActionDate: time.Now(),
			ActionByID: &revokedBy,
			Details:    reason,
			CreatedBy:  revokedBy,
		}

		if err := tx.Create(&history).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

// AddTermHistory adds a new history record for a term
func (r *VolunteerTermRepository) AddTermHistory(termID uint, actionType string, actionBy uint, details string) error {
	history := models.VolunteerTermHistory{
		TermID:     termID,
		ActionType: actionType,
		ActionDate: time.Now(),
		ActionByID: &actionBy,
		Details:    details,
		CreatedBy:  actionBy,
	}

	return r.db.Create(&history).Error
}

// GetTermHistory gets the history of a term
func (r *VolunteerTermRepository) GetTermHistory(termID uint) ([]models.VolunteerTermHistory, error) {
	var history []models.VolunteerTermHistory

	if err := r.db.Where("term_id = ?", termID).
		Preload("ActionBy").
		Order("action_date DESC").
		Find(&history).Error; err != nil {
		return nil, err
	}

	return history, nil
}
