// backend/internal/api/handlers/notification_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/backend/internal/service/notifications"
	"github.com/go-chi/chi/v5"
)

// NotificationHandler gerenda notificações In-APP
type NotificationHandler struct {
	notifService notifications.Service
}

// NewNotificationHandler cria um novo handler
func NewNotificationHandler(service notifications.Service) *NotificationHandler {
	return &NotificationHandler{notifService: service}
}

// GetNotifications lista notificações do usuário logado
// GET /api/v1/notifications
func (h *NotificationHandler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// TODO: Implementar busca real de notificações do usuário
	// Por enquanto retorna array vazio
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]map[string]interface{}{})
}

// MarkAsRead marca notificação como lida
// POST /api/v1/notifications/:id/read
func (h *NotificationHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	notificationID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid notification id", http.StatusBadRequest)
		return
	}

	// TODO: Implementar marcação real
	_ = notificationID

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// MarkAllAsRead marca todas as notificações como lidas
// POST /api/v1/notifications/read-all
func (h *NotificationHandler) MarkAllAsRead(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// TODO: Implementar marcação real

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// GetUnreadCount retorna contagem de notificações não lidas
// GET /api/v1/notifications/unread-count
func (h *NotificationHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromContext(r)
	if userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// TODO: Implementar contagem real
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": 0})
}

// RegisterRoutes registra as rotas de notificações
func (h *NotificationHandler) RegisterRoutes(r chi.Router) {
	r.Route("/notifications", func(r chi.Router) {
		r.Get("/", h.GetNotifications)
		r.Get("/unread-count", h.GetUnreadCount)
		r.Post("/{id}/read", h.MarkAsRead)
		r.Post("/read-all", h.MarkAllAsRead)
	})
}
