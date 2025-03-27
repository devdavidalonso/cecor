package models

import (
	"time"
)

// ModeloTermoVoluntariado representa um modelo de termo de voluntariado
type ModeloTermoVoluntariado struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Titulo       string    `json:"titulo" gorm:"not null"`
	Conteudo     string    `json:"conteudo" gorm:"type:text;not null"`
	Versao       string    `json:"versao" gorm:"not null"`
	Ativo        bool      `json:"ativo" gorm:"default:true"`
	CriadoEm     time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
	CriadoPorID  uint      `json:"criadoPorId" gorm:"not null"`
}

// TableName define o nome da tabela no banco de dados
func (ModeloTermoVoluntariado) TableName() string {
	return "modelos_termos_voluntariado"
}

// TermoVoluntariado representa um termo de voluntariado assinado
type TermoVoluntariado struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	ProfessorID     uint      `json:"professorId" gorm:"not null;index"`
	ModeloID        uint      `json:"modeloId" gorm:"not null"`
	DataAssinatura  time.Time `json:"dataAssinatura" gorm:"not null"`
	DataExpiracao   time.Time `json:"dataExpiracao" gorm:"not null"`
	EnderecoIP      string    `json:"enderecoIP"`
	InfoDispositivo string    `json:"infoDispositivo"`
	TipoAssinatura  string    `json:"tipoAssinatura" gorm:"not null;default:'digital'"`
	Status          string    `json:"status" gorm:"not null;default:'ativo'"` // Ativo, Expirado, Revogado
	DocumentoURL    string    `json:"documentoUrl"`
	LembreteEnviado bool      `json:"lembreteEnviado" gorm:"default:false"`
	CriadoEm        time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm    time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
	CriadoPorID     uint      `json:"criadoPorId" gorm:"not null"`
}

// TableName define o nome da tabela no banco de dados
func (TermoVoluntariado) TableName() string {
	return "termos_voluntariado"
}

// HistoricoTermoVoluntariado representa o histórico de ações em um termo
type HistoricoTermoVoluntariado struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	TermoID     uint      `json:"termoId" gorm:"not null;index"`
	TipoAcao    string    `json:"tipoAcao" gorm:"not null"` // Assinado, Visualizado, Expirado, Renovado
	DataAcao    time.Time `json:"dataAcao" gorm:"not null"`
	AcaoPorID   *uint     `json:"acaoPorId"`
	Detalhes    string    `json:"detalhes"`
	CriadoPorID uint      `json:"criadoPorId" gorm:"not null"`
}

// TableName define o nome da tabela no banco de dados
func (HistoricoTermoVoluntariado) TableName() string {
	return "historicos_termos_voluntariado"
}
