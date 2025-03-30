package models

import (
	"time"
)

// Curso representa um curso no sistema
type Curso struct {
	ID                 uint       `json:"id" gorm:"primaryKey"`
	Nome               string     `json:"nome" gorm:"not null"`
	DescricaoResumida  string     `json:"descricaoResumida"`
	DescricaoDetalhada string     `json:"descricaoDetalhada" gorm:"type:text"`
	CargaHoraria       int        `json:"cargaHoraria" gorm:"not null"`
	NumeroMaximoAlunos int        `json:"numeroMaximoAlunos" gorm:"not null"`
	RequisitosPrevios  string     `json:"requisitosPrevios"`
	NivelDificuldade   string     `json:"nivelDificuldade"`
	PublicoAlvo        string     `json:"publicoAlvo"`
	Tags               string     `json:"tags" gorm:"type:json"`
	DiasSemanais       string     `json:"diasSemanais" gorm:"not null"` // Ex: "1,3,5" para segunda, quarta, sexta
	HorarioInicio      string     `json:"horarioInicio" gorm:"not null"`
	HorarioFim         string     `json:"horarioFim" gorm:"not null"`
	Duracao            int        `json:"duracao" gorm:"not null"` // Em semanas
	DataInicio         time.Time  `json:"dataInicio"`
	DataFim            time.Time  `json:"dataFim"`
	Status             string     `json:"status" gorm:"not null;default:'ativo'"`
	CriadoEm           time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm       time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
	ExcluidoEm         *time.Time `json:"excluidoEm" gorm:"index"`
}

// TableName define o nome da tabela no banco de dados
func (Curso) TableName() string {
	return "cursos"
}

// ProfessorCurso representa a associação entre professor e curso
type ProfessorCurso struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	ProfessorID  uint       `json:"professorId" gorm:"not null;index"`
	CursoID      uint       `json:"cursoId" gorm:"not null;index"`
	Funcao       string     `json:"funcao" gorm:"not null"` // Principal, Auxiliar, Substituto, etc.
	DataInicio   time.Time  `json:"dataInicio" gorm:"not null"`
	DataFim      *time.Time `json:"dataFim"`
	Ativo        bool       `json:"ativo" gorm:"default:true"`
	CriadoEm     time.Time  `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm time.Time  `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (ProfessorCurso) TableName() string {
	return "professores_cursos"
}

// MaterialCurso representa um material do curso
type MaterialCurso struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	CursoID       uint      `json:"cursoId" gorm:"not null;index"`
	Nome          string    `json:"nome" gorm:"not null"`
	Descricao     string    `json:"descricao"`
	Tipo          string    `json:"tipo" gorm:"not null"` // Material, Recurso, Link, etc.
	Caminho       string    `json:"caminho" gorm:"not null"`
	OrdemExibicao int       `json:"ordemExibicao" gorm:"default:0"`
	Obrigatorio   bool      `json:"obrigatorio" gorm:"default:false"`
	CriadoPorID   uint      `json:"criadoPorId" gorm:"not null"`
	CriadoEm      time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm  time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (MaterialCurso) TableName() string {
	return "materiais_cursos"
}

// AulaCurso representa uma aula específica de um curso
type AulaCurso struct {
	ID                 uint      `json:"id" gorm:"primaryKey"`
	CursoID            uint      `json:"cursoId" gorm:"not null;index"`
	Titulo             string    `json:"titulo" gorm:"not null"`
	Descricao          string    `json:"descricao"`
	Data               time.Time `json:"data" gorm:"not null;index"`
	HorarioInicio      string    `json:"horarioInicio"`
	HorarioFim         string    `json:"horarioFim"`
	Status             string    `json:"status" gorm:"not null;default:'agendada'"` // Agendada, Realizada, Cancelada
	MotivoCancelamento string    `json:"motivoCancelamento"`
	CriadoEm           time.Time `json:"criadoEm" gorm:"autoCreateTime"`
	AtualizadoEm       time.Time `json:"atualizadoEm" gorm:"autoUpdateTime"`
}

// TableName define o nome da tabela no banco de dados
func (AulaCurso) TableName() string {
	return "aulas_cursos"
}
