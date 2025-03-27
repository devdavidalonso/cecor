package models

import (
	"time"
)

// Presenca representa o registro de presença de um aluno em uma aula
type Presenca struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	AlunoID         uint      `json:"alunoId" gorm:"not null;index"`
	CursoID         uint      `json:"cursoId" gorm:"not null;index"`
	Data            time.Time `json:"data" gorm:"not null;index"`
	Status          string    `json:"status" gorm:"not null"` // Presente, Ausente, Parcial
	Modulo          string    `json:"modulo"`                 // Módulo específico da aula
	Justificativa   string    `json:"justificativa"`
	PossuiAnexo     bool      `json:"possuiAnexo" gorm:"default:false"`
	AnexoURL        string    `json:"anexoUrl"`
	Observacoes     string    `json:"observacoes"`
	RegistradoPorID uint      `json:"registradoPorId" gorm:"not null"`
	CriadoEm        time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm    time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Presenca) TableName() string {
	return "presencas"
}

// JustificativaAusencia representa uma justificativa para ausências
type JustificativaAusencia struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	AlunoID       uint       `json:"alunoId" gorm:"not null;index"`
	CursoID       uint       `json:"cursoId" gorm:"not null;index"`
	DataInicio    time.Time  `json:"dataInicio" gorm:"not null"`
	DataFim       time.Time  `json:"dataFim" gorm:"not null"`
	Motivo        string     `json:"motivo" gorm:"not null;type:text"`
	DocumentoURL  string     `json:"documentoUrl"`
	Status        string     `json:"status" gorm:"not null;default:'pendente'"` // Pendente, Aprovada, Rejeitada
	Observacoes   string     `json:"observacoes"`
	EnviadoPorID  uint       `json:"enviadoPorId" gorm:"not null"`
	RevisadoPorID *uint      `json:"revisadoPorId"`
	DataRevisao   *time.Time `json:"dataRevisao"`
	CriadoEm      time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm  time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (JustificativaAusencia) TableName() string {
	return "justificativas_ausencias"
}

// AlertaAusencia representa um alerta de ausências para um aluno
type AlertaAusencia struct {
	ID                   uint       `json:"id" gorm:"primaryKey"`
	AlunoID              uint       `json:"alunoId" gorm:"not null;index"`
	CursoID              uint       `json:"cursoId" gorm:"not null;index"`
	Nivel                int        `json:"nivel" gorm:"not null"` // 1, 2, 3, 4 (progressivo)
	ContadorAusencias    int        `json:"contadorAusencias" gorm:"not null"`
	DataPrimeiraAusencia time.Time  `json:"dataPrimeiraAusencia"`
	DataUltimaAusencia   time.Time  `json:"dataUltimaAusencia"`
	Status               string     `json:"status" gorm:"not null;default:'aberto'"` // Aberto, Resolvido
	NotificacaoEnviada   bool       `json:"notificacaoEnviada" gorm:"default:false"`
	DataNotificacao      *time.Time `json:"dataNotificacao"`
	ResolvidoPorID       *uint      `json:"resolvidoPorId"`
	DataResolucao        *time.Time `json:"dataResolucao"`
	ObservacoesResolucao string     `json:"observacoesResolucao"`
	CriadoEm             time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm         time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (AlertaAusencia) TableName() string {
	return "alertas_ausencias"
}

// CompensacaoFalta representa uma atividade compensatória para faltas
type CompensacaoFalta struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	AlunoID         uint       `json:"alunoId" gorm:"not null;index"`
	CursoID         uint       `json:"cursoId" gorm:"not null;index"`
	DatasFaltas     string     `json:"datasFaltas" gorm:"not null"` // Formato JSON com datas
	Atividade       string     `json:"atividade" gorm:"not null;type:text"`
	DataEntrega     time.Time  `json:"dataEntrega" gorm:"not null"`
	Status          string     `json:"status" gorm:"not null;default:'pendente'"` // Pendente, Entregue, Avaliada, Aprovada, Rejeitada
	Avaliacao       string     `json:"avaliacao"`
	DocumentoURL    string     `json:"documentoURL"`
	RegistradoPorID uint       `json:"registradoPorId" gorm:"not null"`
	AvaliadoPorID   *uint      `json:"avaliadoPorId"`
	DataAvaliacao   *time.Time `json:"dataAvaliacao"`
	CriadoEm        time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm    time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (CompensacaoFalta) TableName() string {
	return "compensacoes_faltas"
}
