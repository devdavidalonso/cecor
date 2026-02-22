// backend/internal/api/handlers/helpers.go
package handlers

import (
	"net/http"
	"strconv"
)

// getUserIDFromContext extracts user ID from request context
// This should be replaced with actual auth middleware implementation
func getUserIDFromContext(r *http.Request) uint {
	// Try to get from header first
	userIDStr := r.Header.Get("X-User-ID")
	if userIDStr != "" {
		if id, err := strconv.ParseUint(userIDStr, 10, 32); err == nil {
			return uint(id)
		}
	}
	
	// TODO: Implement actual user extraction from JWT/context
	// For now, return a mock user ID for testing
	return 1
}
