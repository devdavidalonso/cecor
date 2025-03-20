// models/user.go
package models

import (
	"time"
)

// User representa um usuário do sistema (aluno, professor ou administrador)
type User struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	Name      string     `json:"name" gorm:"size:100;not null"`
	Email     string     `json:"email" gorm:"size:100;uniqueIndex;not null"`
	Password  string     `json:"password,omitempty" gorm:"size:255;not null"`
	Profile   string     `json:"profile" gorm:"size:20;not null"` // 'admin', 'aluno', 'professor'
	CPF       string     `json:"cpf" gorm:"size:14;uniqueIndex"`
	BirthDate *time.Time `json:"birth_date"`
	Phone     string     `json:"phone" gorm:"size:20"`
	Address   string     `json:"address" gorm:"type:text"`
	PhotoURL  string     `json:"photo_url" gorm:"size:255"`
	Active    bool       `json:"active" gorm:"default:true"`
	CreatedAt time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`
}

// TableName especifica o nome da tabela no banco de dados
func (User) TableName() string {
	return "users"
}
