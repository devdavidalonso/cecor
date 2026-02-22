// backend/internal/api/handlers/incident_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/incidents"
)

// IncidentHandler handles incident-related HTTP requests
type IncidentHandler struct {
	service incidents.Service
}

// NewIncidentHandler creates a new incident handler
func NewIncidentHandler(service incidents.Service) *IncidentHandler {
	return &IncidentHandler{service: service}
}

// CreateIncident creates a new incident
// POST /api/v1/incidents
func (h *IncidentHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var incident models.Incident
	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set the reporter
	incident.ReportedByID = userID

	if err := h.service.Create(r.Context(), &incident); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(incident)
}

// GetIncident retrieves a single incident by ID
// GET /api/v1/incidents/:id
func (h *IncidentHandler) GetIncident(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	incident, err := h.service.GetByID(r.Context(), uint(id))
	if err != nil {
		if err.Error() == "incident not found" {
			http.Error(w, "Incident not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incident)
}

// UpdateIncident updates an existing incident
// PUT /api/v1/incidents/:id
func (h *IncidentHandler) UpdateIncident(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	var incident models.Incident
	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	incident.ID = uint(id)

	if err := h.service.Update(r.Context(), &incident); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incident)
}

// DeleteIncident soft deletes an incident
// DELETE /api/v1/incidents/:id
func (h *IncidentHandler) DeleteIncident(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ListIncidents lists all incidents with filtering
// GET /api/v1/incidents
func (h *IncidentHandler) ListIncidents(w http.ResponseWriter, r *http.Request) {
	filters := h.parseFilters(r)

	incidents, total, err := h.service.List(r.Context(), filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"data":  incidents,
		"total": total,
		"page":  filters.Page,
		"size":  filters.PageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ListMyIncidents lists incidents reported by the current user
// GET /api/v1/incidents/my
func (h *IncidentHandler) ListMyIncidents(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	filters := h.parseFilters(r)

	incidents, total, err := h.service.ListByReporter(r.Context(), userID, filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"data":  incidents,
		"total": total,
		"page":  filters.Page,
		"size":  filters.PageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ResolveIncident resolves an incident
// POST /api/v1/incidents/:id/resolve
func (h *IncidentHandler) ResolveIncident(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	var req struct {
		ResolutionNotes string `json:"resolutionNotes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.Resolve(r.Context(), uint(id), req.ResolutionNotes, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "resolved"})
}

// ReopenIncident reopens a resolved incident
// POST /api/v1/incidents/:id/reopen
func (h *IncidentHandler) ReopenIncident(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Reopen(r.Context(), uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "reopened"})
}

// GetIncidentComments retrieves comments for an incident
// GET /api/v1/incidents/:id/comments
func (h *IncidentHandler) GetIncidentComments(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	comments, err := h.service.GetComments(r.Context(), uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// AddIncidentComment adds a comment to an incident
// POST /api/v1/incidents/:id/comments
func (h *IncidentHandler) AddIncidentComment(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Comment string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Comment == "" {
		http.Error(w, "Comment is required", http.StatusBadRequest)
		return
	}

	if err := h.service.AddComment(r.Context(), uint(id), userID, req.Comment); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// GetIncidentStatistics returns statistics about incidents
// GET /api/v1/incidents/statistics
func (h *IncidentHandler) GetIncidentStatistics(w http.ResponseWriter, r *http.Request) {
	filters := h.parseFilters(r)

	stats, err := h.service.GetStatistics(r.Context(), filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// parseFilters parses query parameters into IncidentFilters
func (h *IncidentHandler) parseFilters(r *http.Request) incidents.IncidentFilters {
	filters := incidents.IncidentFilters{
		Page:     1,
		PageSize: 20,
	}

	query := r.URL.Query()

	if t := query.Get("type"); t != "" {
		filters.Type = t
	}
	if s := query.Get("status"); s != "" {
		filters.Status = s
	}
	if sev := query.Get("severity"); sev != "" {
		filters.Severity = sev
	}
	if search := query.Get("search"); search != "" {
		filters.Search = search
	}
	if page := query.Get("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			filters.Page = p
		}
	}
	if size := query.Get("size"); size != "" {
		if s, err := strconv.Atoi(size); err == nil && s > 0 {
			filters.PageSize = s
		}
	}
	if startDate := query.Get("startDate"); startDate != "" {
		if d, err := time.Parse("2006-01-02", startDate); err == nil {
			filters.StartDate = &d
		}
	}
	if endDate := query.Get("endDate"); endDate != "" {
		if d, err := time.Parse("2006-01-02", endDate); err == nil {
			filters.EndDate = &d
		}
	}

	return filters
}

// RegisterRoutes registers all incident routes
func (h *IncidentHandler) RegisterRoutes(r chi.Router) {
	r.Route("/incidents", func(r chi.Router) {
		// Public/Authenticated routes
		r.Get("/", h.ListIncidents)
		r.Get("/my", h.ListMyIncidents)
		r.Get("/statistics", h.GetIncidentStatistics)
		r.Post("/", h.CreateIncident)
		r.Get("/{id}", h.GetIncident)
		r.Put("/{id}", h.UpdateIncident)
		r.Delete("/{id}", h.DeleteIncident)
		r.Post("/{id}/resolve", h.ResolveIncident)
		r.Post("/{id}/reopen", h.ReopenIncident)
		r.Get("/{id}/comments", h.GetIncidentComments)
		r.Post("/{id}/comments", h.AddIncidentComment)
	})
}
