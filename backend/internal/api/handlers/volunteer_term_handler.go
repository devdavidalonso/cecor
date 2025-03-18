// internal/api/handlers/volunteer_term_handler.go

package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/database"
	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/gin-gonic/gin"
)

// SignVolunteerTermRequest represents data for signing a volunteer term
type SignVolunteerTermRequest struct {
	TemplateID uint   `json:"template_id" binding:"required"`
	DeviceInfo string `json:"device_info"`
}

// SignVolunteerTerm handles the signing of a volunteer term by a teacher
func SignVolunteerTerm(c *gin.Context) {
	var req SignVolunteerTermRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}
	
	// Get authenticated user ID (teacher)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}
	
	// Get user profile
	userProfile, exists := c.Get("userProfile")
	if !exists || userProfile != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only teachers can sign volunteer terms"})
		return
	}
	
	// Connect to database
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error connecting to database"})
		return
	}
	
	// Create repository
	repo := database.NewVolunteerTermRepository(db)
	
	// Verify template exists and is active
	template, err := repo.GetTermTemplateByID(req.TemplateID)
	if err != nil {
		if err == database.ErrTemplateNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Term template not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve term template"})
		return
	}
	
	if !template.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot sign an inactive term template"})
		return
	}
	
	// Set expiration date (1 year from now)
	expirationDate := time.Now().AddDate(1, 0, 0)
	
	// Create the volunteer term
	term := &models.VolunteerTerm{
		TeacherID:      userID.(uint),
		TemplateID:     req.TemplateID,
		SignedAt:       time.Now(),
		ExpirationDate: expirationDate,
		IPAddress:      c.ClientIP(),
		SignatureType:  "digital",
		Status:         "active",
		ReminderSent:   false,
	}
	
	// Add device info if provided
	if req.DeviceInfo != "" {
		term.DeviceInfo = req.DeviceInfo
	}
	
	// Sign the term
	err = repo.SignVolunteerTerm(term)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign term", "details": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"message": "Term signed successfully",
		"term": term,
	})
}

// GetMyVolunteerTerms handles retrieving all terms signed by the authenticated teacher
func GetMyVolunteerTerms(c *gin.Context) {
	// Get authenticated user ID (teacher)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}
	
	// Get user profile
	userProfile, exists := c.Get("userProfile")
	if !exists || userProfile != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only teachers can access this endpoint"})
		return
	}
	
	// Connect to database
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error connecting to database"})
		return
	}
	
	// Create repository
	repo := database.NewVolunteerTermRepository(db)
	
	// Get terms
	terms, err := repo.GetVolunteerTermsByTeacherID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve terms"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"terms": terms,
		"count": len(terms),
	})
}

// GetCurrentTemplate handles retrieving the current active template
func GetCurrentTemplate(c *gin.Context) {
	// Connect to database
	db, err := database.GetDB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error connecting to database"})
		return
	}
	
	// Create repository
	repo := database.NewVolunteerTermRepository(db)
	
	// Get active template
	template, err := repo.GetActiveTermTemplate()
	if err != nil {
		if err == database.ErrNoActiveTemplate {
			c.JSON(http.StatusNotFound, gin.H{"error": "No active term template found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve active template"})
		return
	}
	
	c.JSON(http.StatusOK, template)
}