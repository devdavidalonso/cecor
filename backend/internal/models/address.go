package models

import (
	"time"
)

// Address represents a physical address
type Address struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	UserID       uint       `json:"userId" gorm:"not null;unique;index"` // Foreign key to User
	CEP          string     `json:"cep" gorm:"size:10"`
	Street       string     `json:"street" gorm:"size:255"`
	Number       string     `json:"number" gorm:"size:20"`
	Complement   string     `json:"complement" gorm:"size:100"`
	Neighborhood string     `json:"neighborhood" gorm:"size:100"`
	City         string     `json:"city" gorm:"size:100"`
	State        string     `json:"state" gorm:"size:2"`
	CreatedAt    time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt    *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName defines the table name in the database
func (Address) TableName() string {
	return "addresses"
}
