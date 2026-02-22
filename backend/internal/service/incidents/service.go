// backend/internal/service/incidents/service.go
package incidents

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// Service defines the interface for incident operations
type Service interface {
	// CRUD
	Create(ctx context.Context, incident *models.Incident) error
	GetByID(ctx context.Context, id uint) (*models.Incident, error)
	Update(ctx context.Context, incident *models.Incident) error
	Delete(ctx context.Context, id uint) error
	
	// Listings
	List(ctx context.Context, filters IncidentFilters) ([]IncidentWithDetails, int64, error)
	ListByReporter(ctx context.Context, reporterID uint, filters IncidentFilters) ([]IncidentWithDetails, int64, error)
	ListByCourse(ctx context.Context, courseID uint, filters IncidentFilters) ([]IncidentWithDetails, int64, error)
	ListByStudent(ctx context.Context, studentID uint, filters IncidentFilters) ([]IncidentWithDetails, int64, error)
	
	// Actions
	Resolve(ctx context.Context, id uint, resolutionNotes string, resolvedByID uint) error
	Reopen(ctx context.Context, id uint) error
	AddComment(ctx context.Context, incidentID uint, userID uint, comment string) error
	GetComments(ctx context.Context, incidentID uint) ([]models.IncidentComment, error)
	
	// Statistics
	GetStatistics(ctx context.Context, filters IncidentFilters) (*IncidentStatistics, error)
}

// IncidentFilters represents filters for listing incidents
type IncidentFilters struct {
	Type        string
	Status      string
	Severity    string
	CourseID    *uint
	StudentID   *uint
	ReporterID  *uint
	StartDate   *time.Time
	EndDate     *time.Time
	Search      string
	Page        int
	PageSize    int
}

// IncidentWithDetails represents an incident with related data
type IncidentWithDetails struct {
	models.Incident
	CourseName   string `json:"courseName,omitempty"`
	StudentName  string `json:"studentName,omitempty"`
	ReporterName string `json:"reportedByName,omitempty"`
}

// IncidentStatistics represents statistics about incidents
type IncidentStatistics struct {
	Total          int64            `json:"total"`
	ByType         map[string]int64 `json:"byType"`
	ByStatus       map[string]int64 `json:"byStatus"`
	BySeverity     map[string]int64 `json:"bySeverity"`
	OpenCount      int64            `json:"openCount"`
	ResolvedToday  int64            `json:"resolvedToday"`
	OpenThisWeek   int64            `json:"openThisWeek"`
}

// service implements the Service interface
type service struct {
	db *gorm.DB
}

// NewService creates a new incident service
func NewService(db *gorm.DB) Service {
	return &service{db: db}
}

// Create creates a new incident
func (s *service) Create(ctx context.Context, incident *models.Incident) error {
	if incident.Type == "" {
		return fmt.Errorf("incident type is required")
	}
	if incident.Severity == "" {
		return fmt.Errorf("incident severity is required")
	}
	if incident.Title == "" {
		return fmt.Errorf("incident title is required")
	}
	if incident.Description == "" {
		return fmt.Errorf("incident description is required")
	}
	
	incident.Status = models.IncidentStatusOpen
	incident.CreatedAt = time.Now()
	incident.UpdatedAt = time.Now()
	
	return s.db.WithContext(ctx).Create(incident).Error
}

// GetByID retrieves an incident by ID with related data
func (s *service) GetByID(ctx context.Context, id uint) (*models.Incident, error) {
	var incident models.Incident
	err := s.db.WithContext(ctx).
		Preload("Course").
		Preload("Student").
		Preload("Student.User").
		Preload("ReportedBy").
		Preload("ResolvedBy").
		First(&incident, id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("incident not found")
		}
		return nil, err
	}
	
	return &incident, nil
}

// Update updates an incident
func (s *service) Update(ctx context.Context, incident *models.Incident) error {
	// Check if incident exists and can be edited
	existing, err := s.GetByID(ctx, incident.ID)
	if err != nil {
		return err
	}
	
	if !existing.CanEdit() {
		return fmt.Errorf("incident cannot be edited (status: %s)", existing.Status)
	}
	
	incident.UpdatedAt = time.Now()
	
	return s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("id = ?", incident.ID).
		Updates(map[string]interface{}{
			"type":        incident.Type,
			"severity":    incident.Severity,
			"title":       incident.Title,
			"description": incident.Description,
			"course_id":   incident.CourseID,
			"student_id":  incident.StudentID,
			"updated_at":  incident.UpdatedAt,
		}).Error
}

// Delete soft deletes an incident
func (s *service) Delete(ctx context.Context, id uint) error {
	now := time.Now()
	return s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("id = ?", id).
		Update("deleted_at", now).Error
}

// List lists all incidents with filters
func (s *service) List(ctx context.Context, filters IncidentFilters) ([]IncidentWithDetails, int64, error) {
	return s.listIncidents(ctx, filters, false)
}

// ListByReporter lists incidents reported by a specific user
func (s *service) ListByReporter(ctx context.Context, reporterID uint, filters IncidentFilters) ([]IncidentWithDetails, int64, error) {
	filters.ReporterID = &reporterID
	return s.listIncidents(ctx, filters, false)
}

// ListByCourse lists incidents for a specific course
func (s *service) ListByCourse(ctx context.Context, courseID uint, filters IncidentFilters) ([]IncidentWithDetails, int64, error) {
	filters.CourseID = &courseID
	return s.listIncidents(ctx, filters, false)
}

// ListByStudent lists incidents for a specific student
func (s *service) ListByStudent(ctx context.Context, studentID uint, filters IncidentFilters) ([]IncidentWithDetails, int64, error) {
	filters.StudentID = &studentID
	return s.listIncidents(ctx, filters, false)
}

// listIncidents is the internal method for listing incidents
func (s *service) listIncidents(ctx context.Context, filters IncidentFilters, onlyOpen bool) ([]IncidentWithDetails, int64, error) {
	query := s.db.WithContext(ctx).Model(&models.Incident{}).
		Joins("LEFT JOIN courses ON incidents.course_id = courses.id").
		Joins("LEFT JOIN students ON incidents.student_id = students.id").
		Joins("LEFT JOIN users ON incidents.reported_by_id = users.id").
		Where("incidents.deleted_at IS NULL")
	
	// Apply filters
	if filters.Type != "" {
		query = query.Where("incidents.type = ?", filters.Type)
	}
	if filters.Status != "" {
		query = query.Where("incidents.status = ?", filters.Status)
	}
	if filters.Severity != "" {
		query = query.Where("incidents.severity = ?", filters.Severity)
	}
	if filters.CourseID != nil {
		query = query.Where("incidents.course_id = ?", *filters.CourseID)
	}
	if filters.StudentID != nil {
		query = query.Where("incidents.student_id = ?", *filters.StudentID)
	}
	if filters.ReporterID != nil {
		query = query.Where("incidents.reported_by_id = ?", *filters.ReporterID)
	}
	if filters.StartDate != nil {
		query = query.Where("incidents.created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("incidents.created_at <= ?", *filters.EndDate)
	}
	if onlyOpen {
		query = query.Where("incidents.status IN ?", []string{string(models.IncidentStatusOpen), string(models.IncidentStatusInAnalysis)})
	}
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where(
			"incidents.title LIKE ? OR incidents.description LIKE ?",
			searchPattern, searchPattern,
		)
	}
	
	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Pagination
	page := filters.Page
	if page < 1 {
		page = 1
	}
	pageSize := filters.PageSize
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	
	// Get incidents with details
	var incidents []IncidentWithDetails
	err := query.
		Select(`
			incidents.*,
			courses.name as course_name,
			users.name as reporter_name,
			(SELECT users.name FROM users 
			 INNER JOIN students ON students.user_id = users.id 
			 WHERE students.id = incidents.student_id) as student_name
		`).
		Order("incidents.created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Scan(&incidents).Error
	
	if err != nil {
		return nil, 0, err
	}
	
	return incidents, total, nil
}

// Resolve resolves an incident
func (s *service) Resolve(ctx context.Context, id uint, resolutionNotes string, resolvedByID uint) error {
	now := time.Now()
	
	return s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":           models.IncidentStatusResolved,
			"resolution_notes": resolutionNotes,
			"resolved_by_id":   resolvedByID,
			"resolved_at":      now,
			"updated_at":       now,
		}).Error
}

// Reopen reopens a resolved incident
func (s *service) Reopen(ctx context.Context, id uint) error {
	now := time.Now()
	
	return s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":         models.IncidentStatusOpen,
			"resolved_by_id": nil,
			"resolved_at":    nil,
			"updated_at":     now,
		}).Error
}

// AddComment adds a comment to an incident
func (s *service) AddComment(ctx context.Context, incidentID uint, userID uint, comment string) error {
	commentModel := models.IncidentComment{
		IncidentID: incidentID,
		UserID:     userID,
		Comment:    comment,
		CreatedAt:  time.Now(),
	}
	
	return s.db.WithContext(ctx).Create(&commentModel).Error
}

// GetComments retrieves all comments for an incident
func (s *service) GetComments(ctx context.Context, incidentID uint) ([]models.IncidentComment, error) {
	var comments []models.IncidentComment
	err := s.db.WithContext(ctx).
		Preload("User").
		Where("incident_id = ?", incidentID).
		Order("created_at ASC").
		Find(&comments).Error
	
	return comments, err
}

// GetStatistics returns statistics about incidents
func (s *service) GetStatistics(ctx context.Context, filters IncidentFilters) (*IncidentStatistics, error) {
	stats := &IncidentStatistics{
		ByType:     make(map[string]int64),
		ByStatus:   make(map[string]int64),
		BySeverity: make(map[string]int64),
	}
	
	query := s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("deleted_at IS NULL")
	
	// Apply date filters
	if filters.StartDate != nil {
		query = query.Where("created_at >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("created_at <= ?", *filters.EndDate)
	}
	
	// Total count
	query.Count(&stats.Total)
	
	// By type
	var typeCounts []struct {
		Type  string
		Count int64
	}
	s.db.WithContext(ctx).Model(&models.Incident{}).
		Select("type, COUNT(*) as count").
		Where("deleted_at IS NULL").
		Group("type").
		Scan(&typeCounts)
	for _, tc := range typeCounts {
		stats.ByType[tc.Type] = tc.Count
	}
	
	// By status
	var statusCounts []struct {
		Status string
		Count  int64
	}
	s.db.WithContext(ctx).Model(&models.Incident{}).
		Select("status, COUNT(*) as count").
		Where("deleted_at IS NULL").
		Group("status").
		Scan(&statusCounts)
	for _, sc := range statusCounts {
		stats.ByStatus[sc.Status] = sc.Count
	}
	
	// By severity
	var severityCounts []struct {
		Severity string
		Count    int64
	}
	s.db.WithContext(ctx).Model(&models.Incident{}).
		Select("severity, COUNT(*) as count").
		Where("deleted_at IS NULL").
		Group("severity").
		Scan(&severityCounts)
	for _, sc := range severityCounts {
		stats.BySeverity[sc.Severity] = sc.Count
	}
	
	// Open count
	s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("deleted_at IS NULL").
		Where("status IN ?", []string{string(models.IncidentStatusOpen), string(models.IncidentStatusInAnalysis)}).
		Count(&stats.OpenCount)
	
	// Resolved today
	today := time.Now().Truncate(24 * time.Hour)
	s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("deleted_at IS NULL").
		Where("status = ?", models.IncidentStatusResolved).
		Where("resolved_at >= ?", today).
		Count(&stats.ResolvedToday)
	
	// Open this week
	weekStart := time.Now().AddDate(0, 0, -7)
	s.db.WithContext(ctx).Model(&models.Incident{}).
		Where("deleted_at IS NULL").
		Where("status IN ?", []string{string(models.IncidentStatusOpen), string(models.IncidentStatusInAnalysis)}).
		Where("created_at >= ?", weekStart).
		Count(&stats.OpenThisWeek)
	
	return stats, nil
}
