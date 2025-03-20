// internal/repositories/notification_repository.go
package repositories

import (
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"gorm.io/gorm"
)

// NotificationRepository implements database operations for Notifications
type NotificationRepository struct {
	db *gorm.DB
}

// NewNotificationRepository creates a new instance of NotificationRepository
func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{db}
}

// Create creates a new notification
func (r *NotificationRepository) Create(notification *models.Notification) (models.Notification, error) {
	err := r.db.Create(notification).Error
	return *notification, err
}

// FindByID returns a notification by ID
func (r *NotificationRepository) FindByID(id uint) (models.Notification, error) {
	var notification models.Notification
	err := r.db.First(&notification, id).Error
	return notification, err
}

// Update updates a notification
func (r *NotificationRepository) Update(notification models.Notification) (models.Notification, error) {
	err := r.db.Save(&notification).Error
	return notification, err
}

// Delete removes a notification
func (r *NotificationRepository) Delete(id uint) error {
	return r.db.Delete(&models.Notification{}, id).Error
}

// FindByUserID returns all notifications for a user
func (r *NotificationRepository) FindByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

// FindUnreadByUserID returns all unread notifications for a user
func (r *NotificationRepository) FindUnreadByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Where("user_id = ? AND read_at IS NULL", userID).Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

// MarkAsRead marks a notification as read
func (r *NotificationRepository) MarkAsRead(id uint) error {
	return r.db.Model(&models.Notification{}).Where("id = ?", id).Update("read_at", time.Now()).Error
}

// MarkAllAsRead marks all notifications for a user as read
func (r *NotificationRepository) MarkAllAsRead(userID uint) error {
	return r.db.Model(&models.Notification{}).Where("user_id = ? AND read_at IS NULL", userID).Update("read_at", time.Now()).Error
}

// CountUnread counts all unread notifications for a user
func (r *NotificationRepository) CountUnread(userID uint) (int, error) {
	var count int64
	err := r.db.Model(&models.Notification{}).Where("user_id = ? AND read_at IS NULL", userID).Count(&count).Error
	return int(count), err
}

// SendNotification creates and sends a notification
func (r *NotificationRepository) SendNotification(userID uint, title, message, notificationType string, entityType string, entityID *uint) (models.Notification, error) {
	notification := models.Notification{
		UserID:          userID,
		Title:           title,
		Message:         message,
		Type:            notificationType,
		EntityType:      entityType,
		EntityID:        entityID,
		CreatedAt:       time.Now(),
		ReadAt:          nil,
		DeliveryStatus:  "pending",
		DeliveryAttempt: 0,
	}

	return r.Create(&notification)
}

// FindPendingNotifications finds all pending notifications
func (r *NotificationRepository) FindPendingNotifications() ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Where("delivery_status = ?", "pending").Find(&notifications).Error
	return notifications, err
}

// UpdateDeliveryStatus updates the delivery status of a notification
func (r *NotificationRepository) UpdateDeliveryStatus(id uint, status string, errorMessage string) error {
	updates := map[string]interface{}{
		"delivery_status":  status,
		"delivery_attempt": gorm.Expr("delivery_attempt + 1"),
		"last_attempt_at":  time.Now(),
	}

	if errorMessage != "" {
		updates["error_message"] = errorMessage
	}

	if status == "delivered" {
		updates["delivered_at"] = time.Now()
	}

	return r.db.Model(&models.Notification{}).Where("id = ?", id).Updates(updates).Error
}
