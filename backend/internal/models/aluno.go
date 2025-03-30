package models

import (
	"time"
)

// Aluno representa um estudante no sistema
type Aluno struct {
	ID                    uint       `json:"id" gorm:"primaryKey"`
	Nome                  string     `json:"nome" gorm:"not null"`
	DataNascimento        time.Time  `json:"dataNascimento" gorm:"not null"`
	Idade                 int        `json:"idade" gorm:"-"` // Campo calculado, não armazenado no banco
	CPF                   string     `json:"cpf" gorm:"uniqueIndex"`
	RG                    string     `json:"rg"`
	Email                 string     `json:"email" gorm:"not null;uniqueIndex"`
	TelefonePrincipal     string     `json:"telefonePrincipal" gorm:"not null"`
	TelefoneSecundario    string     `json:"telefoneSecundario"`
	TelefoneEmergencia    string     `json:"telefoneEmergencia"`
	Endereco              string     `json:"endereco"`
	Cidade                string     `json:"cidade"`
	Estado                string     `json:"estado"`
	CEP                   string     `json:"cep"`
	Latitude              float64    `json:"latitude"`
	Longitude             float64    `json:"longitude"`
	FotoURL               string     `json:"fotoURL"`
	RedesSociais          string     `json:"redesSociais" gorm:"type:json"`
	InformacoesMedicas    string     `json:"informacoesMedicas"`
	NecessidadesEspeciais string     `json:"necessidadesEspeciais"`
	Observacoes           string     `json:"observacoes"`
	NumeroMatricula       string     `json:"numeroMatricula" gorm:"uniqueIndex"`
	Status                string     `json:"status" gorm:"not null;default:'ativo'"` // ativo, inativo, suspenso
	CriadoEm              time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm          time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
	ExcluidoEm            *time.Time `json:"excluidoEm" gorm:"index"`
}

// TableName define o nome da tabela no banco de dados
func (Aluno) TableName() string {
	return "alunos"
}

// CalcularIdade calcula a idade do aluno a partir da data de nascimento
func (a *Aluno) CalcularIdade() {
	hoje := time.Now()
	idade := hoje.Year() - a.DataNascimento.Year()

	// Ajusta a idade se ainda não fez aniversário este ano
	if hoje.YearDay() < a.DataNascimento.YearDay() {
		idade--
	}

	a.Idade = idade
}

// Responsavel representa um responsável pelo aluno
type Responsavel struct {
	ID               uint   `json:"id" gorm:"primaryKey"`
	AlunoID          uint   `json:"alunoId" gorm:"not null;index"`
	Nome             string `json:"nome" gorm:"not null"`
	GrauParentesco   string `json:"grauParentesco" gorm:"not null"`
	CPF              string `json:"cpf"`
	RG               string `json:"rg"`
	Email            string `json:"email"`
	TelefonePessoal  string `json:"telefonePessoal"`
	TelefoneTrabalho string `json:"telefoneTrabalho"`
	TelefoneCasa     string `json:"telefoneCasa"`
	Endereco         string `json:"endereco"`
	// Permissões específicas
	PermiteRetirarAluno bool       `json:"permiteRetirarAluno" gorm:"default:false"`
	ReceberNotificacoes bool       `json:"receberNotificacoes" gorm:"default:true"`
	AutorizarAtividades bool       `json:"autorizarAtividades" gorm:"default:false"`
	CriadoEm            time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm        time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
	ExcluidoEm          *time.Time `json:"excluidoEm" gorm:"index"`
}

// TableName define o nome da tabela no banco de dados
func (Responsavel) TableName() string {
	return "responsaveis"
}

// Documento representa um documento digitalizado de um aluno
type Documento struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	AlunoID        uint      `json:"alunoId" gorm:"not null;index"`
	Nome           string    `json:"nome" gorm:"not null"`
	Tipo           string    `json:"tipo" gorm:"not null"` // identidade, cpf, comprovante_residencia, etc.
	Descricao      string    `json:"descricao"`
	Caminho        string    `json:"caminho" gorm:"not null"`
	TamanhoBytes   int64     `json:"tamanhoBytes"`
	MimeType       string    `json:"mimeType"`
	Hash           string    `json:"hash"` // Para verificação de integridade
	CarregadoPorID uint      `json:"carregadoPorId" gorm:"not null"`
	CriadoEm       time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm   time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (Documento) TableName() string {
	return "documentos"
}

// NotaAluno representa uma nota ou observação sobre um aluno
type NotaAluno struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	AlunoID      uint      `json:"alunoId" gorm:"not null;index"`
	AutorID      uint      `json:"autorId" gorm:"not null"`
	Tipo         string    `json:"tipo" gorm:"default:'observacao'"` // observacao, avaliacao, etc.
	Conteudo     string    `json:"conteudo" gorm:"type:text;not null"`
	Confidencial bool      `json:"confidencial" gorm:"default:false"` // Se true, visível apenas para administradores
	CriadoEm     time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (NotaAluno) TableName() string {
	return "notas_alunos"
}
