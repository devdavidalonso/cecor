package models

import (
	"time"
)

// Matricula representa a matrícula de um aluno em um curso
type Matricula struct {
	ID                  uint       `json:"id" gorm:"primaryKey"`
	AlunoID             uint       `json:"alunoId" gorm:"not null;index"`
	CursoID             uint       `json:"cursoId" gorm:"not null;index"`
	NumeroMatricula     string     `json:"numeroMatricula" gorm:"not null;unique"`
	Status              string     `json:"status" gorm:"not null;default:'ativa'"` // Ativa, Em curso, Trancada, Concluída, Cancelada
	DataInicio          time.Time  `json:"dataInicio" gorm:"not null"`
	DataFim             *time.Time `json:"dataFim"`
	DataMatricula       time.Time  `json:"dataMatricula" gorm:"not null"`
	MotivoCancelamento  string     `json:"motivoCancelamento"`
	TermoCompromissoURL string     `json:"termoCompromissoUrl"`
	CriadoEm            time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm        time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
	ExcluidoEm          *time.Time `json:"excluidoEm" gorm:"index"`
}

// TableName define o nome da tabela no banco de dados
func (Matricula) TableName() string {
	return "matriculas"
}

// HistoricoMatricula registra mudanças no status da matrícula
type HistoricoMatricula struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	MatriculaID    uint      `json:"matriculaId" gorm:"not null;index"`
	StatusAnterior string    `json:"statusAnterior"`
	StatusNovo     string    `json:"statusNovo" gorm:"not null"`
	Observacao     string    `json:"observacao"`
	DataAlteracao  time.Time `json:"dataAlteracao" gorm:"not null"`
	UsuarioID      uint      `json:"usuarioId" gorm:"not null"`
	CriadoEm       time.Time `json:"criadoEm" gorm:"autoCreateTime"`
}

// TableName define o nome da tabela no banco de dados
func (HistoricoMatricula) TableName() string {
	return "historicos_matriculas"
}

// ListaEspera representa um aluno na lista de espera de um curso
type ListaEspera struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	AlunoID       uint       `json:"alunoId" gorm:"not null;index"`
	CursoID       uint       `json:"cursoId" gorm:"not null;index"`
	DataInscricao time.Time  `json:"dataInscricao" gorm:"not null"`
	Prioridade    int        `json:"prioridade" gorm:"default:0"`
	Observacao    string     `json:"observacao"`
	Status        string     `json:"status" gorm:"not null;default:'aguardando'"` // Aguardando, Chamado, Desistência
	DataChamada   *time.Time `json:"dataChamada"`
	DataResposta  *time.Time `json:"dataResposta"`
	Resposta      string     `json:"resposta"` // Aceitou, Recusou
	CriadoEm      time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm  time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (ListaEspera) TableName() string {
	return "lista_espera"
}

// Certificado representa um certificado emitido para uma matrícula
type Certificado struct {
	ID                uint       `json:"id" gorm:"primaryKey"`
	MatriculaID       uint       `json:"matriculaId" gorm:"not null;index"`
	AlunoID           uint       `json:"alunoId" gorm:"not null;index"`
	CursoID           uint       `json:"cursoId" gorm:"not null;index"`
	Tipo              string     `json:"tipo" gorm:"not null"` // Conclusão, Participação, Em curso
	DataEmissao       time.Time  `json:"dataEmissao" gorm:"not null"`
	DataExpiracao     *time.Time `json:"dataExpiracao"`
	CertificadoURL    string     `json:"certificadoUrl"`
	CodigoVerificacao string     `json:"codigoVerificacao" gorm:"unique"`
	QRCodeURL         string     `json:"qrCodeUrl"`
	Status            string     `json:"status" gorm:"not null;default:'ativo'"` // Ativo, Revogado, Expirado
	MotivoRevogacao   string     `json:"motivoRevogacao"`
	CriadoPorID       uint       `json:"criadoPorId" gorm:"not null"`
	CriadoEm          time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm      time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Certificado) TableName() string {
	return "certificados"
}

// ModeloCertificado representa um modelo de certificado
type ModeloCertificado struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Nome         string    `json:"nome" gorm:"not null"`
	Descricao    string    `json:"descricao"`
	Tipo         string    `json:"tipo" gorm:"not null"` // Conclusão, Participação, Em curso
	ConteudoHTML string    `json:"conteudoHtml" gorm:"type:text;not null"`
	EstiloCSS    string    `json:"estiloCSS" gorm:"type:text"`
	Padrao       bool      `json:"padrao" gorm:"default:false"`
	Ativo        bool      `json:"ativo" gorm:"default:true"`
	CriadoPorID  uint      `json:"criadoPorId" gorm:"not null"`
	CriadoEm     time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (ModeloCertificado) TableName() string {
	return "modelos_certificados"
}
