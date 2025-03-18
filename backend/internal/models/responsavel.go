// internal/models/responsavel.go

package models

import (
	"time"
)

// Responsavel representa um responsável por um aluno
type Responsavel struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	AlunoID             uint      `json:"aluno_id" gorm:"not null"`
	Nome                string    `json:"nome" gorm:"size:100;not null"`
	CPF                 string    `json:"cpf" gorm:"size:14"`
	Email               string    `json:"email" gorm:"size:100"`
	Telefone            string    `json:"telefone" gorm:"size:20"`
	GrauParentesco      string    `json:"grau_parentesco" gorm:"size:50;not null"`
	PrioridadeContato   int       `json:"prioridade_contato" gorm:"not null;default:3"` // 1, 2 ou 3
	// Permissões específicas
	PermBuscarAluno     bool      `json:"perm_buscar_aluno" gorm:"default:false"`
	PermNotificacoes    bool      `json:"perm_notificacoes" gorm:"default:true"`
	PermAutorizarAtiv   bool      `json:"perm_autorizar_atividades" gorm:"default:false"`
	PermReunioes        bool      `json:"perm_reunioes" gorm:"default:true"`
	PermInfoFinanceiras bool      `json:"perm_info_financeiras" gorm:"default:false"`
	PermDocs            bool      `json:"perm_documentos" gorm:"default:true"`
	PermEmergencia      bool      `json:"perm_emergencia" gorm:"default:false"`
	PermAcessoPortal    bool      `json:"perm_acesso_portal" gorm:"default:true"`
	Status              string    `json:"status" gorm:"size:20;default:'ativo'"` // 'ativo', 'inativo'
	CreatedAt           time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	
	// Relacionamentos
	Aluno               Aluno     `json:"aluno,omitempty" gorm:"foreignKey:AlunoID"`
}

// TableName especifica o nome da tabela no banco de dados
func (Responsavel) TableName() string {
	return "responsaveis"
}