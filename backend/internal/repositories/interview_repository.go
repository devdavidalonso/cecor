// internal/database/interview_repository.go

package repositories

import (
	"errors"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

var (
	ErrFormNotFound      = errors.New("form not found")
	ErrQuestionNotFound  = errors.New("question not found")
	ErrInterviewNotFound = errors.New("interview not found")
	ErrResponseNotFound  = errors.New("response not found")
)

// InterviewRepository implements database operations for forms and interviews
type InterviewRepository struct {
	db *gorm.DB
}

// NewInterviewRepository creates a new instance of InterviewRepository
func NewInterviewRepository(db *gorm.DB) *InterviewRepository {
	return &InterviewRepository{db}
}

// CreateForm creates a new form
func (r *InterviewRepository) CreateForm(form *models.Form) error {
	return r.db.Create(form).Error
}

// GetFormByID retrieves a form by its ID, including its questions
func (r *InterviewRepository) GetFormByID(formID uint) (*models.Form, error) {
	var form models.Form
	if err := r.db.Where("id = ?", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFormNotFound
		}
		return nil, err
	}

	// Load questions
	if err := r.db.Where("form_id = ?", formID).Order("display_order").Find(&form.Questions).Error; err != nil {
		return nil, err
	}

	return &form, nil
}

// UpdateForm updates an existing form
func (r *InterviewRepository) UpdateForm(form *models.Form) error {
	return r.db.Save(form).Error
}

// DeleteForm performs a soft delete on a form
func (r *InterviewRepository) DeleteForm(formID uint) error {
	return r.db.Model(&models.Form{}).Where("id = ?", formID).Update("deleted_at", time.Now()).Error
}

// ListForms lists forms with pagination and filters
func (r *InterviewRepository) ListForms(offset, limit int, filters map[string]interface{}) ([]models.Form, int, error) {
	var forms []models.Form
	var total int64

	query := r.db.Model(&models.Form{}).Where("deleted_at IS NULL")

	// Apply filters
	if title, ok := filters["title"].(string); ok && title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if formType, ok := filters["type"].(string); ok && formType != "" {
		query = query.Where("type = ?", formType)
	}
	if audience, ok := filters["target_audience"].(string); ok && audience != "" {
		query = query.Where("target_audience = ?", audience)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total matching records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&forms).Error; err != nil {
		return nil, 0, err
	}

	return forms, int(total), nil
}

// AddQuestion adds a question to a form
func (r *InterviewRepository) AddQuestion(question *models.FormQuestion) error {
	return r.db.Create(question).Error
}

// UpdateQuestion updates an existing question
func (r *InterviewRepository) UpdateQuestion(question *models.FormQuestion) error {
	return r.db.Save(question).Error
}

// DeleteQuestion deletes a question
func (r *InterviewRepository) DeleteQuestion(questionID uint) error {
	return r.db.Delete(&models.FormQuestion{}, questionID).Error
}

// GetQuestionsByFormID gets all questions for a form
func (r *InterviewRepository) GetQuestionsByFormID(formID uint) ([]models.FormQuestion, error) {
	var questions []models.FormQuestion
	if err := r.db.Where("form_id = ?", formID).Order("display_order").Find(&questions).Error; err != nil {
		return nil, err
	}
	return questions, nil
}

// ScheduleInterview schedules a new interview
func (r *InterviewRepository) ScheduleInterview(interview *models.Interview) error {
	return r.db.Create(interview).Error
}

// GetInterviewByID retrieves an interview by its ID with details
func (r *InterviewRepository) GetInterviewByID(interviewID uint) (*models.Interview, error) {
	var interview models.Interview
	if err := r.db.Where("id = ?", interviewID).
		Preload("Form").
		Preload("User").
		Preload("Interviewer").
		First(&interview).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInterviewNotFound
		}
		return nil, err
	}
	return &interview, nil
}

// UpdateInterview updates an existing interview
func (r *InterviewRepository) UpdateInterview(interview *models.Interview) error {
	return r.db.Save(interview).Error
}

// CancelInterview cancels an interview
func (r *InterviewRepository) CancelInterview(interviewID uint, reason string) error {
	return r.db.Model(&models.Interview{}).
		Where("id = ?", interviewID).
		Updates(map[string]interface{}{
			"status": "canceled",
			"notes":  reason,
		}).Error
}

// CompleteInterview marks an interview as completed
func (r *InterviewRepository) CompleteInterview(interviewID uint) error {
	return r.db.Model(&models.Interview{}).
		Where("id = ?", interviewID).
		Updates(map[string]interface{}{
			"status":          "completed",
			"completion_date": time.Now(),
		}).Error
}

// RescheduleInterview reschedules an interview
func (r *InterviewRepository) RescheduleInterview(interviewID uint, newDate time.Time) error {
	return r.db.Model(&models.Interview{}).
		Where("id = ?", interviewID).
		Updates(map[string]interface{}{
			"status":         "rescheduled",
			"scheduled_date": newDate,
		}).Error
}

// ListInterviews lists interviews with pagination and filters
func (r *InterviewRepository) ListInterviews(offset, limit int, filters map[string]interface{}) ([]models.Interview, int, error) {
	var interviews []models.Interview
	var total int64

	query := r.db.Model(&models.Interview{})

	// Apply filters
	if userID, ok := filters["user_id"].(uint); ok && userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if formType, ok := filters["type"].(string); ok && formType != "" {
		query = query.Joins("JOIN forms ON interviews.form_id = forms.id").
			Where("forms.type = ?", formType)
	}
	if startDate, ok := filters["start_date"].(time.Time); ok && !startDate.IsZero() {
		query = query.Where("scheduled_date >= ?", startDate)
	}
	if endDate, ok := filters["end_date"].(time.Time); ok && !endDate.IsZero() {
		query = query.Where("scheduled_date <= ?", endDate)
	}

	// Count total matching records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with preloads
	if err := query.Preload("Form").
		Preload("User").
		Preload("Interviewer").
		Order("scheduled_date DESC").
		Offset(offset).
		Limit(limit).
		Find(&interviews).Error; err != nil {
		return nil, 0, err
	}

	return interviews, int(total), nil
}

// ListInterviewsByUserID lists interviews for a specific user
func (r *InterviewRepository) ListInterviewsByUserID(userID uint) ([]models.Interview, error) {
	var interviews []models.Interview
	if err := r.db.Where("user_id = ?", userID).
		Preload("Form").
		Order("scheduled_date DESC").
		Find(&interviews).Error; err != nil {
		return nil, err
	}
	return interviews, nil
}

// SubmitResponse submits a form response with answers
func (r *InterviewRepository) SubmitResponse(response *models.FormResponse, answers []models.FormAnswerDetail) error {
	// Start transaction
	tx := r.db.Begin()

	// Create the response
	if err := tx.Create(response).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create each answer detail
	for i := range answers {
		answers[i].ResponseID = response.ID
		if err := tx.Create(&answers[i]).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

// GetResponsesByFormID gets all responses for a specific form
func (r *InterviewRepository) GetResponsesByFormID(formID uint) ([]models.FormResponse, error) {
	var responses []models.FormResponse
	if err := r.db.Where("form_id = ?", formID).
		Preload("User").
		Preload("AnswerDetails").
		Preload("AnswerDetails.Question").
		Order("submission_date DESC").
		Find(&responses).Error; err != nil {
		return nil, err
	}
	return responses, nil
}

// GetResponsesByUserID gets all responses submitted by a specific user
func (r *InterviewRepository) GetResponsesByUserID(userID uint) ([]models.FormResponse, error) {
	var responses []models.FormResponse
	if err := r.db.Where("user_id = ?", userID).
		Preload("Form").
		Order("submission_date DESC").
		Find(&responses).Error; err != nil {
		return nil, err
	}
	return responses, nil
}

// GetResponseDetail gets detailed information about a specific response
func (r *InterviewRepository) GetResponseDetail(responseID uint) (*models.FormResponse, error) {
	var response models.FormResponse
	if err := r.db.Where("id = ?", responseID).
		Preload("Form").
		Preload("User").
		Preload("Interview").
		First(&response).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrResponseNotFound
		}
		return nil, err
	}

	// Load answer details
	if err := r.db.Where("response_id = ?", responseID).
		Preload("Question").
		Find(&response.AnswerDetails).Error; err != nil {
		return nil, err
	}

	return &response, nil
}
