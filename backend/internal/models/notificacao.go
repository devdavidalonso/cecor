package models

import (
	"time"
)

// Notificacao representa uma notificação enviada para um usuário
type Notificacao struct {
	ID                  uint       `json:"id" gorm:"primaryKey"`
	UsuarioID           uint       `json:"usuarioId" gorm:"not null;index"`
	Titulo              string     `json:"titulo" gorm:"not null"`
	Mensagem            string     `json:"mensagem" gorm:"type:text;not null"`
	Tipo                string     `json:"tipo" gorm:"not null"` // Ausência, Evento, Sistema, etc.
	TipoEntidade        string     `json:"tipoEntidade"`         // Aluno, Curso, Matrícula, etc.
	EntidadeID          *uint      `json:"entidadeId"`
	StatusEntrega       string     `json:"statusEntrega" gorm:"not null;default:'pendente'"` // Pendente, Entregue, Falha
	TentativasEntrega   int        `json:"tentativasEntrega" gorm:"not null;default:0"`
	DataUltimaTentativa *time.Time `json:"dataUltimaTentativa"`
	DataEntrega         *time.Time `json:"dataEntrega"`
	DataLeitura         *time.Time `json:"dataLeitura"`
	MensagemErro        string     `json:"mensagemErro"`
	CriadoEm            time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm        time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Notificacao) TableName() string {
	return "notificacoes"
}

// CanalNotificacao representa um canal de comunicação para envio de notificações
type CanalNotificacao struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	UsuarioID       uint       `json:"usuarioId" gorm:"not null;index"`
	Tipo            string     `json:"tipo" gorm:"not null"`          // Email, Telegram, SMS, Push, App
	Identificador   string     `json:"identificador" gorm:"not null"` // Endereço de email, número de telefone, chat ID do Telegram
	Ativo           bool       `json:"ativo" gorm:"default:true"`
	Principal       bool       `json:"principal" gorm:"default:false"`
	Verificado      bool       `json:"verificado" gorm:"default:false"`
	DataVerificacao *time.Time `json:"dataVerificacao"`
	CriadoEm        time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm    time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (CanalNotificacao) TableName() string {
	return "canais_notificacoes"
}

// ConfiguracaoNotificacao representa as preferências de notificação de um usuário
type ConfiguracaoNotificacao struct {
	ID                 uint      `json:"id" gorm:"primaryKey"`
	UsuarioID          uint      `json:"usuarioId" gorm:"not null;index"`
	TipoNotificacao    string    `json:"tipoNotificacao" gorm:"not null"` // Ausência, Evento, Sistema, etc.
	Habilitado         bool      `json:"habilitado" gorm:"default:true"`
	CanaisHabilitados  string    `json:"canaisHabilitados" gorm:"not null"` // Formato JSON com canais habilitados (Email, Telegram, etc.)
	HorariosPermitidos string    `json:"horariosPermitidos"`                // Formato JSON com horários permitidos
	CriadoEm           time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm       time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (ConfiguracaoNotificacao) TableName() string {
	return "configuracoes_notificacoes"
}

// ModeloNotificacao representa um template para notificações
type ModeloNotificacao struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Nome          string    `json:"nome" gorm:"not null"`
	Tipo          string    `json:"tipo" gorm:"not null"` // Ausência, Evento, Sistema, etc.
	Assunto       string    `json:"assunto" gorm:"not null"`
	ConteudoHTML  string    `json:"conteudoHtml" gorm:"type:text;not null"`
	ConteudoTexto string    `json:"conteudoTexto" gorm:"type:text;not null"`
	Variaveis     string    `json:"variaveis" gorm:"type:json"` // Lista de variáveis disponíveis para o template
	Ativo         bool      `json:"ativo" gorm:"default:true"`
	Padrao        bool      `json:"padrao" gorm:"default:false"`
	CriadoPorID   uint      `json:"criadoPorId" gorm:"not null"`
	CriadoEm      time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm  time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (ModeloNotificacao) TableName() string {
	return "modelos_notificacoes"
}

// AgendamentoNotificacao representa uma notificação agendada para envio futuro
type AgendamentoNotificacao struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	ModeloID     uint       `json:"modeloId" gorm:"not null"`
	UsuarioID    uint       `json:"usuarioId" gorm:"not null;index"`
	Dados        string     `json:"dados" gorm:"type:json;not null"` // Dados para preencher o template
	DataAgendada time.Time  `json:"dataAgendada" gorm:"not null;index"`
	Status       string     `json:"status" gorm:"not null;default:'agendada'"` // Agendada, Enviada, Cancelada, Falha
	DataEnvio    *time.Time `json:"dataEnvio"`
	MensagemErro string     `json:"mensagemErro"`
	CriadoPorID  uint       `json:"criadoPorId" gorm:"not null"`
	CriadoEm     time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (AgendamentoNotificacao) TableName() string {
	return "agendamentos_notificacoes"
}
