// internal/api/handlers/form_handler.go

package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/internal/database"
	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/gin-gonic/gin"
)

// CreateFormRequest represents the data for creating a form
type CreateFormRequest struct {
	Title          string `json:"title" binding:"required"`
	Description    string `json:"description"`
	Type           string `json:"type" binding:"required,oneof=enrollment feedback evaluation"`
	IsRequired     bool   `json:"is_required"`
	TargetAudience string `json:"target_audience" binding:"required,oneof=student guardian teacher"`
	Status         string `json:"status" binding:"required,oneof=draft active inactive"`
	Questions      []struct {
		QuestionText        string `json:"question_text" binding:"required"`
		HelpText            string `json:"help_text"`
		QuestionType        string `json:"question_type" binding:"required,oneof=text multiple_choice likert file date"`
		Options             string `json:"options"`
		IsRequired          bool   `json:"is_required"`
		DisplayOrder        int    `json:"display_order" binding:"required,min=1"`
		ConditionalParentID *uint  `json:"conditional_parent_id"`
		ConditionalValue    string `json:"conditional_value"`
		ValidationRules     string `json:"validation_rules"`
	} `json:"questions"`
}

// CreateForm handles the creation of a new form
func CreateForm(c *gin.Context) {
	var req CreateFormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}
	
	// Get authenticated user ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}
	
	// Connect to database
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error connecting to database"})
		return
	}
	
	// Create repository
	repo := database.NewInterviewRepository(db)
	
	// Start transaction
	tx := db.Begin()
	
	// Create form
	form := &models.Form{
		Title:          req.Title,
		Description:    req.Description,
		Type:           req.Type,
		IsRequired:     req.IsRequired,
		TargetAudience: req.TargetAudience,
		Status:         req.Status,
		CreatedBy:      userID.(uint),
	}
	
	// Create form in transaction
	if err := tx.Create(form).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form", "details": err.Error()})
		return
	}
	
	// Add questions if provided
	for _, q := range req.Questions {
		question := &models.FormQuestion{
			FormID:             form.ID,
			QuestionText:       q.QuestionText,
			HelpText:           q.HelpText,
			QuestionType:       q.QuestionType,
			Options:            q.Options,
			IsRequired:         q.IsRequired,
			DisplayOrder:       q.DisplayOrder,
			ConditionalParentID: q.ConditionalParentID,
			ConditionalValue:   q.ConditionalValue,
			ValidationRules:    q.ValidationRules,
		}
		
		if err := tx.Create(question).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create question", "details": err.Error()})
			return
		}
	}
	
	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction", "details": err.Error()})
		return
	}
	
	// Get the created form with questions
	createdForm, err := repo.GetFormByID(form.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Form created but failed to retrieve details"})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"message": "Form created successfully",
		"form":    createdForm,
	})
}

// ListForms handles listing forms with pagination and filters
func ListForms(c *gin.Context) {
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	title := c.Query("title")
	formType := c.Query("type")
	audience := c.Query("target_audience")
	status := c.Query("status")
	
	// Connect to database
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error connecting to database"})
		return
	}
	
	// Create repository
	repo := database.NewInterviewRepository(db)
	
	// Prepare filters
	filters := map[string]interface{}{
		"title":           title,
		"type":            formType,
		"target_audience": audience,
		"status":          status,
	}
	
	// Get forms with pagination
	forms, total, err := repo.ListForms(offset, limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list forms"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"forms":  forms,
		"total":  total,
		"offset": offset,
		"limit":  limit,
	})
}

// GetFormDetails handles retrieving the details of a form
func GetFormDetails(c *gin.Context) {
	formID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form ID"})
		return
	}
	
	// Connect to database
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error connecting to database"})
		return
	}
	
	// Create repository
	repo := database.NewInterviewRepository(db)
	
	// Get form with questions
	form, err := repo.GetFormByID(uint(formID))
	if err != nil {
		if err == database.ErrFormNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Form not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve form"})
		return
	}
	
	c.JSON(http.StatusOK, form)
}