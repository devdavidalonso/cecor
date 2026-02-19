package models

import (
	"time"
)

// Location represents a physical location (classroom, lab, etc.)
type Location struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Capacity  int       `json:"capacity"`
	Resources string    `json:"resources"` // Text field
	IsActive  bool      `json:"isActive" gorm:"default:true"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName defines the table name in the database
func (Location) TableName() string {
	return "locations"
}
