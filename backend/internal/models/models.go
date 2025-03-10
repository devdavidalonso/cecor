package models

import "time"

// Aluno representa um aluno no sistema
type Aluno struct {
	ID              int       `json:"id"`
	Nome            string    `json:"nome"`
	DataNascimento  string    `json:"data_nascimento"`
	Endereco        string    `json:"endereco,omitempty"`
	Telefone        string    `json:"telefone,omitempty"`
	Email           string    `json:"email,omitempty"`
	Responsavel     string    `json:"responsavel,omitempty"`
	Parentesco      string    `json:"parentesco,omitempty"`
	TelefoneResp    string    `json:"telefone_responsavel,omitempty"`
	DataCriacao     time.Time `json:"data_criacao,omitempty"`
}

// Curso representa um curso no sistema
type Curso struct {
	ID             int    `json:"id"`
	Nome           string `json:"nome"`
	Descricao      string `json:"descricao,omitempty"`
	DiaSemana      string `json:"dia_semana,omitempty"`
	HorarioInicio  string `json:"horario_inicio,omitempty"`
	HorarioFim     string `json:"horario_fim,omitempty"`
}

// Matricula representa a matrícula de um aluno em um curso
type Matricula struct {
	ID               int       `json:"id"`
	AlunoID          int       `json:"aluno_id"`
	CursoID          int       `json:"curso_id"`
	DataMatricula    string    `json:"data_matricula"`
	NumeroMatricula  string    `json:"numero_matricula"`
	Status           string    `json:"status,omitempty"`
	DataCriacao      time.Time `json:"data_criacao,omitempty"`
	AlunoNome        string    `json:"aluno_nome,omitempty"`
	CursoNome        string    `json:"curso_nome,omitempty"`
}

// Presenca representa o registro de presença de um aluno
type Presenca struct {
	ID           int       `json:"id"`
	MatriculaID  int       `json:"matricula_id"`
	DataAula     string    `json:"data_aula"`
	Presente     bool      `json:"presente"`
	DataCriacao  time.Time `json:"data_criacao,omitempty"`
}

// PeriodoPresenca representa um período para registrar presenças
type PeriodoPresenca struct {
	CursoID    int          `json:"curso_id"`
	Mes        int          `json:"mes"`
	Ano        int          `json:"ano"`
	DiasDoMes  []string     `json:"dias_do_mes"`
	Matriculas []Matricula  `json:"matriculas"`
}

// PresencaRequest representa uma requisição para registrar presença
type PresencaRequest struct {
	MatriculaID int  `json:"matricula_id"`
	DataAula    string `json:"data_aula"`
	Presente    bool `json:"presente"`
}