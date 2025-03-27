package models

import (
	"time"
)

// Usuario representa um usuário do sistema
type Usuario struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	Nome            string     `json:"nome" gorm:"not null"`
	Email           string     `json:"email" gorm:"not null;unique"`
	Senha           string     `json:"-" gorm:"not null"`      // Não exposta em JSON
	Perfil          string     `json:"perfil" gorm:"not null"` // admin, gestor, professor, aluno, responsavel
	CPF             string     `json:"cpf" gorm:"unique"`
	DataNascimento  *time.Time `json:"dataNascimento"`
	Telefone        string     `json:"telefone"`
	Endereco        string     `json:"endereco"`
	FotoURL         string     `json:"fotoUrl"`
	Ativo           bool       `json:"ativo" gorm:"default:true"`
	UltimoLogin     *time.Time `json:"ultimoLogin"`
	TokenResetSenha string     `json:"-"`
	ExpiracaoToken  *time.Time `json:"-"`
	CriadoEm        time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm    time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
	ExcluidoEm      *time.Time `json:"excluidoEm" gorm:"index"`
}

// TableName define o nome da tabela no banco de dados
func (Usuario) TableName() string {
	return "usuarios"
}

// PerfilUsuario representa um perfil específico atribuído a um usuário
type PerfilUsuario struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	UsuarioID    uint       `json:"usuarioId" gorm:"not null;index"`
	TipoPerfil   string     `json:"tipoPerfil" gorm:"not null"` // admin, gestor, professor, aluno, responsavel
	Principal    bool       `json:"principal" gorm:"default:false"`
	Ativo        bool       `json:"ativo" gorm:"default:true"`
	TipoEscopo   string     `json:"tipoEscopo"` // curso, departamento
	EscopoID     *uint      `json:"escopoId"`
	DataInicio   time.Time  `json:"dataInicio" gorm:"not null"`
	DataFim      *time.Time `json:"dataFim"`
	CriadoEm     time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (PerfilUsuario) TableName() string {
	return "perfis_usuarios"
}

// Permissao representa uma permissão no sistema
type Permissao struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Nome         string    `json:"nome" gorm:"not null;unique"`
	Codigo       string    `json:"codigo" gorm:"not null;unique"`
	Descricao    string    `json:"descricao"`
	CriadoEm     time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Permissao) TableName() string {
	return "permissoes"
}

// PermissaoPerfil representa a associação entre perfis e permissões
type PermissaoPerfil struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	PerfilTipo  string    `json:"perfilTipo" gorm:"not null;index"`
	PermissaoID uint      `json:"permissaoId" gorm:"not null;index"`
	CriadoEm    time.Time `json:"criadoEm" gorm:"autoCreateTime"`
}

// TableName define o nome da tabela no banco de dados
func (PermissaoPerfil) TableName() string {
	return "permissoes_perfis"
}

// LogAcesso representa um registro de acesso ao sistema
type LogAcesso struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UsuarioID  uint      `json:"usuarioId" gorm:"index"`
	DataHora   time.Time `json:"dataHora" gorm:"not null"`
	EnderecoIP string    `json:"enderecoIP"`
	UserAgent  string    `json:"userAgent"`
	Acao       string    `json:"acao" gorm:"not null"` // Login, Logout, Falha
	Detalhes   string    `json:"detalhes"`
}

// TableName define o nome da tabela no banco de dados
func (LogAcesso) TableName() string {
	return "logs_acessos"
}

// LogAuditoria representa um registro de auditoria para mudanças no sistema
type LogAuditoria struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	TipoEntidade    string    `json:"tipoEntidade" gorm:"not null"`
	EntidadeID      uint      `json:"entidadeId" gorm:"not null"`
	Acao            string    `json:"acao" gorm:"not null"` // Criar, Atualizar, Excluir
	UsuarioID       uint      `json:"usuarioId" gorm:"not null"`
	DadosAnteriores string    `json:"dadosAnteriores" gorm:"type:json"`
	DadosNovos      string    `json:"dadosNovos" gorm:"type:json"`
	CriadoEm        time.Time `json:"criadoEm" gorm:"autoCreateTime"`
}

// TableName define o nome da tabela no banco de dados
func (LogAuditoria) TableName() string {
	return "logs_auditoria"
}
