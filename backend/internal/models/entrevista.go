package models

import (
	"time"
)

// Formulario representa um formulário/questionário no sistema
type Formulario struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Titulo       string     `json:"titulo" gorm:"not null"`
	Descricao    string     `json:"descricao"`
	Tipo         string     `json:"tipo" gorm:"not null"` // Entrevista, Avaliação, Inscrição, etc.
	Obrigatorio  bool       `json:"obrigatorio" gorm:"default:false"`
	PublicoAlvo  string     `json:"publicoAlvo" gorm:"not null"`               // Aluno, Professor, Responsável
	Status       string     `json:"status" gorm:"not null;default:'rascunho'"` // Rascunho, Ativo, Arquivado
	CriadoPorID  uint       `json:"criadoPorId" gorm:"not null"`
	CriadoEm     time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
	ExcluidoEm   *time.Time `json:"excluidoEm" gorm:"index"`
}

// TableName define o nome da tabela no banco de dados
func (Formulario) TableName() string {
	return "formularios"
}

// Pergunta representa uma pergunta em um formulário
type Pergunta struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	FormularioID     uint      `json:"formularioId" gorm:"not null;index"`
	TextoPergunta    string    `json:"textoPergunta" gorm:"type:text;not null"`
	TextoAjuda       string    `json:"textoAjuda"`
	TipoPergunta     string    `json:"tipoPergunta" gorm:"not null"` // Texto, Múltipla escolha, Likert, Arquivo, Data
	Opcoes           string    `json:"opcoes" gorm:"type:json"`      // Lista de opções para múltipla escolha
	Obrigatoria      bool      `json:"obrigatoria" gorm:"default:true"`
	OrdemExibicao    int       `json:"ordemExibicao" gorm:"not null"`
	PerguntaPaiID    *uint     `json:"perguntaPaiId"`                    // Para perguntas condicionais
	ValorCondicional string    `json:"valorCondicional"`                 // Valor que ativa esta pergunta condicional
	RegrasValidacao  string    `json:"regrasValidacao" gorm:"type:json"` // Regras de validação em formato JSON
	CriadoEm         time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm     time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Pergunta) TableName() string {
	return "perguntas"
}

// Entrevista representa um agendamento de entrevista com um usuário
type Entrevista struct {
	ID                  uint       `json:"id" gorm:"primaryKey"`
	FormularioID        uint       `json:"formularioId" gorm:"not null"`
	UsuarioID           uint       `json:"usuarioId" gorm:"not null;index"` // Entrevistado
	DataAgendada        time.Time  `json:"dataAgendada" gorm:"not null"`
	EntrevistadorID     *uint      `json:"entrevistadorId"`
	Status              string     `json:"status" gorm:"not null;default:'agendada'"` // Agendada, Concluída, Cancelada, Reagendada
	DataConclusao       *time.Time `json:"dataConclusao"`
	Observacoes         string     `json:"observacoes"`
	TipoGatilho         string     `json:"tipoGatilho"` // Matrícula, Periódica
	EntidadeRelacionada string     `json:"entidadeRelacionada"`
	EntidadeID          *uint      `json:"entidadeId"`
	LembreteEnviado     bool       `json:"lembreteEnviado" gorm:"default:false"`
	CriadoEm            time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm        time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Entrevista) TableName() string {
	return "entrevistas"
}

// RespostaFormulario representa um conjunto de respostas a um formulário
type RespostaFormulario struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	EntrevistaID    *uint     `json:"entrevistaId"`
	FormularioID    uint      `json:"formularioId" gorm:"not null"`
	UsuarioID       uint      `json:"usuarioId" gorm:"not null"`
	DataEnvio       time.Time `json:"dataEnvio" gorm:"not null"`
	StatusConclusao string    `json:"statusConclusao" gorm:"not null;default:'completo'"` // Completo, Parcial
	EnderecoIP      string    `json:"enderecoIP"`
	CriadoEm        time.Time `json:"criadoEm" gorm:"autoCreateTime"`
}

// TableName define o nome da tabela no banco de dados
func (RespostaFormulario) TableName() string {
	return "respostas_formularios"
}

// DetalhesResposta representa detalhes das respostas a perguntas específicas
type DetalhesResposta struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	RespostaID     uint      `json:"respostaId" gorm:"not null;index"`
	PerguntaID     uint      `json:"perguntaId" gorm:"not null"`
	RespostaTexto  string    `json:"respostaTexto" gorm:"type:text"`
	RespostaOpcoes string    `json:"respostaOpcoes" gorm:"type:json"` // Para múltipla escolha
	ArquivoURL     string    `json:"arquivoUrl"`
	CriadoEm       time.Time `json:"criadoEm" gorm:"autoCreateTime"`
}

// TableName define o nome da tabela no banco de dados
func (DetalhesResposta) TableName() string {
	return "detalhes_respostas"
}
