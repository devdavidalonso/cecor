// repositories/audit_repository.go
package repositories

import (
	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// AuditRepository implements database operations for audit logs
type AuditRepository struct {
	db *gorm.DB
}

// NewAuditRepository creates a new instance of AuditRepository
func NewAuditRepository(db *gorm.DB) *AuditRepository {
	return &AuditRepository{db}
}

// Create adds a new audit log entry
func (r *AuditRepository) Create(auditLog *models.AuditLog) error {
	return r.db.Create(auditLog).Error
}

// FindByEntityID returns audit logs for a specific entity
func (r *AuditRepository) FindByEntityID(entityType string, entityID uint) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	if err := r.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").
		Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}

// FindByUserID returns audit logs for actions performed by a specific user
func (r *AuditRepository) FindByUserID(userID uint) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	if err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}

// FindWithFilters // GetSystemAuditLogs Obtém logs de auditoria do sistema com filtros
func (r *AuditRepository) FindWithFilters(entityType string, entityID uint, actionType string) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	if err := r.db.Where("entity_type = ? AND entity_id = ? AND action = ?", entityType, entityID, actionType).
		Order("created_at DESC").
		Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}
