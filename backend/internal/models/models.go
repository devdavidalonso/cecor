package models

import (
	"time"
)

// Aluno representa um estudante no sistema
type Aluno struct {
	ID             uint      `gorm:"primaryKey;column:id" json:"id"`
	Nome           string    `gorm:"size:100;not null;column:nome" json:"nome"`
	DataNascimento time.Time `gorm:"column:data_nascimento" json:"data_nascimento"`
	CPF            string    `gorm:"size:14;column:cpf" json:"cpf"`
	Email          string    `gorm:"size:100;column:email" json:"email"`
	Telefone       string    `gorm:"size:20;column:telefone" json:"telefone"`
	Observacao     string    `gorm:"column:observacao" json:"observacao"`
	DataCriacao    time.Time `gorm:"column:data_criacao;default:CURRENT_TIMESTAMP" json:"data_criacao"`
	Ativo          bool      `gorm:"column:ativo;default:true" json:"ativo"`
	Responsaveis   []Responsavel `gorm:"foreignKey:AlunoID" json:"responsaveis,omitempty"`
	Matriculas     []Matricula   `gorm:"foreignKey:AlunoID" json:"matriculas,omitempty"`
}

// TableName especifica o nome da tabela para o modelo Aluno
func (Aluno) TableName() string {
	return "alunos"
}

// Responsavel representa o responsável por um aluno
type Responsavel struct {
	ID          uint      `gorm:"primaryKey;column:id" json:"id"`
	Nome        string    `gorm:"size:100;not null;column:nome" json:"nome"`
	Telefone    string    `gorm:"size:20;column:telefone" json:"telefone"`
	AlunoID     uint      `gorm:"column:aluno_id" json:"aluno_id"`
	DataCriacao time.Time `gorm:"column:data_criacao;default:CURRENT_TIMESTAMP" json:"data_criacao"`
}

// TableName especifica o nome da tabela para o modelo Responsavel
func (Responsavel) TableName() string {
	return "responsaveis"
}

// Curso representa um curso oferecido
type Curso struct {
	ID            uint      `gorm:"primaryKey;column:id" json:"id"`
	Nome          string    `gorm:"size:100;not null;column:nome" json:"nome"`
	Descricao     string    `gorm:"column:descricao" json:"descricao"`
	DiaSemana     string    `gorm:"size:20;column:dia_semana" json:"dia_semana"`
	HorarioInicio string    `gorm:"column:horario_inicio" json:"horario_inicio"`
	HorarioFim    string    `gorm:"column:horario_fim" json:"horario_fim"`
	Professor1    string    `gorm:"size:100;column:professor1" json:"professor1"`
	Professor2    string    `gorm:"size:100;column:professor2" json:"professor2"`
	Professor3    string    `gorm:"size:100;column:professor3" json:"professor3"`
	Professor4    string    `gorm:"size:100;column:professor4" json:"professor4"`
	Professor5    string    `gorm:"size:100;column:professor5" json:"professor5"`
	DataCriacao   time.Time `gorm:"column:data_criacao;default:CURRENT_TIMESTAMP" json:"data_criacao"`
	Ativo         bool      `gorm:"column:ativo;default:true" json:"ativo"`
	Matriculas    []Matricula `gorm:"foreignKey:CursoID" json:"matriculas,omitempty"`
}

// TableName especifica o nome da tabela para o modelo Curso
func (Curso) TableName() string {
	return "cursos"
}

// Matricula representa a matrícula de um aluno em um curso
type Matricula struct {
	ID              uint      `gorm:"primaryKey;column:id" json:"id"`
	AlunoID         uint      `gorm:"column:aluno_id" json:"aluno_id"`
	CursoID         uint      `gorm:"column:curso_id" json:"curso_id"`
	DataMatricula   time.Time `gorm:"column:data_matricula" json:"data_matricula"`
	NumeroMatricula string    `gorm:"size:20;uniqueIndex;column:numero_matricula" json:"numero_matricula"`
	Status          string    `gorm:"column:status;default:'em_curso'" json:"status"` 
	TipoCertificado string    `gorm:"column:tipo_certificado;default:'nenhum'" json:"tipo_certificado"`
	Observacoes     string    `gorm:"column:observacoes" json:"observacoes"`
	DataCriacao     time.Time `gorm:"column:data_criacao;default:CURRENT_TIMESTAMP" json:"data_criacao"`
	Aluno           *Aluno    `gorm:"foreignKey:AlunoID" json:"aluno,omitempty"`
	Curso           *Curso    `gorm:"foreignKey:CursoID" json:"curso,omitempty"`
}

// TableName especifica o nome da tabela para o modelo Matricula
func (Matricula) TableName() string {
	return "matriculas"
}
