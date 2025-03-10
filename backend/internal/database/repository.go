package database

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
)

// Repository define a interface para operações com o banco de dados
type Repository struct {
	DB *sql.DB
}

// NewRepository cria um novo repositório
func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

// GetAlunos retorna todos os alunos
func (r *Repository) GetAlunos() ([]models.Aluno, error) {
	query := `SELECT id, nome, data_nascimento, endereco, telefone, email, 
              responsavel, parentesco, telefone_responsavel, data_criacao 
              FROM alunos WHERE ativo = TRUE ORDER BY nome`
	
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alunos []models.Aluno
	for rows.Next() {
		var aluno models.Aluno
		var endereco, telefone, email, responsavel, parentesco, telefoneResp sql.NullString

		err := rows.Scan(
			&aluno.ID, 
			&aluno.Nome, 
			&aluno.DataNascimento,
			&endereco,
			&telefone,
			&email,
			&responsavel,
			&parentesco,
			&telefoneResp,
			&aluno.DataCriacao,
		)
		if err != nil {
			continue
		}

		if endereco.Valid {
			aluno.Endereco = endereco.String
		}
		if telefone.Valid {
			aluno.Telefone = telefone.String
		}
		if email.Valid {
			aluno.Email = email.String
		}
		if responsavel.Valid {
			aluno.Responsavel = responsavel.String
		}
		if parentesco.Valid {
			aluno.Parentesco = parentesco.String
		}
		if telefoneResp.Valid {
			aluno.TelefoneResp = telefoneResp.String
		}

		alunos = append(alunos, aluno)
	}

	return alunos, nil
}

// GetAluno retorna um aluno pelo ID
func (r *Repository) GetAluno(id int) (models.Aluno, error) {
	var aluno models.Aluno
	var endereco, telefone, email, responsavel, parentesco, telefoneResp sql.NullString

	query := `SELECT id, nome, data_nascimento, endereco, telefone, email, 
              responsavel, parentesco, telefone_responsavel, data_criacao 
              FROM alunos WHERE id = ? AND ativo = TRUE`
	
	err := r.DB.QueryRow(query, id).Scan(
		&aluno.ID, 
		&aluno.Nome, 
		&aluno.DataNascimento,
		&endereco,
		&telefone,
		&email,
		&responsavel,
		&parentesco,
		&telefoneResp,
		&aluno.DataCriacao,
	)
	
	if err != nil {
		return aluno, err
	}

	if endereco.Valid {
		aluno.Endereco = endereco.String
	}
	if telefone.Valid {
		aluno.Telefone = telefone.String
	}
	if email.Valid {
		aluno.Email = email.String
	}
	if responsavel.Valid {
		aluno.Responsavel = responsavel.String
	}
	if parentesco.Valid {
		aluno.Parentesco = parentesco.String
	}
	if telefoneResp.Valid {
		aluno.TelefoneResp = telefoneResp.String
	}

	return aluno, nil
}

// CreateAluno cria um novo aluno
func (r *Repository) CreateAluno(aluno models.Aluno) (int, error) {
	query := `INSERT INTO alunos (nome, data_nascimento, endereco, telefone, email, 
              responsavel, parentesco, telefone_responsavel) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	
	result, err := r.DB.Exec(
		query,
		aluno.Nome,
		aluno.DataNascimento,
		nullIfEmpty(aluno.Endereco),
		nullIfEmpty(aluno.Telefone),
		nullIfEmpty(aluno.Email),
		nullIfEmpty(aluno.Responsavel),
		nullIfEmpty(aluno.Parentesco),
		nullIfEmpty(aluno.TelefoneResp),
	)
	
	if err != nil {
		return 0, err
	}
	
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	
	return int(id), nil
}

// GetCursos retorna todos os cursos
func (r *Repository) GetCursos() ([]models.Curso, error) {
	query := `SELECT id, nome, descricao, dia_semana, horario_inicio, horario_fim
              FROM cursos WHERE ativo = TRUE ORDER BY nome`
	
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cursos []models.Curso
	for rows.Next() {
		var curso models.Curso
		var descricao, diaSemana, horarioInicio, horarioFim sql.NullString

		err := rows.Scan(
			&curso.ID, 
			&curso.Nome,
			&descricao,
			&diaSemana,
			&horarioInicio,
			&horarioFim,
		)
		if err != nil {
			continue
		}

		if descricao.Valid {
			curso.Descricao = descricao.String
		}
		if diaSemana.Valid {
			curso.DiaSemana = diaSemana.String
		}
		if horarioInicio.Valid {
			curso.HorarioInicio = horarioInicio.String
		}
		if horarioFim.Valid {
			curso.HorarioFim = horarioFim.String
		}

		cursos = append(cursos, curso)
	}

	return cursos, nil
}

// GetCurso retorna um curso pelo ID
func (r *Repository) GetCurso(id int) (models.Curso, error) {
	var curso models.Curso
	var descricao, diaSemana, horarioInicio, horarioFim sql.NullString

	query := `SELECT id, nome, descricao, dia_semana, horario_inicio, horario_fim
              FROM cursos WHERE id = ? AND ativo = TRUE`
	
	err := r.DB.QueryRow(query, id).Scan(
		&curso.ID, 
		&curso.Nome,
		&descricao,
		&diaSemana,
		&horarioInicio,
		&horarioFim,
	)
	
	if err != nil {
		return curso, err
	}

	if descricao.Valid {
		curso.Descricao = descricao.String
	}
	if diaSemana.Valid {
		curso.DiaSemana = diaSemana.String
	}
	if horarioInicio.Valid {
		curso.HorarioInicio = horarioInicio.String
	}
	if horarioFim.Valid {
		curso.HorarioFim = horarioFim.String
	}

	return curso, nil
}

// CreateMatricula cria uma nova matrícula
func (r *Repository) CreateMatricula(matricula models.Matricula) (int, string, error) {
	// Gerar número de matrícula
	timestamp := time.Now().Format("20060102")
	numeroMatricula := fmt.Sprintf("MAT%s%d%d", timestamp, matricula.AlunoID, matricula.CursoID)
	
	query := `INSERT INTO matriculas (aluno_id, curso_id, data_matricula, numero_matricula, status)
              VALUES (?, ?, ?, ?, ?)`
	
	result, err := r.DB.Exec(
		query,
		matricula.AlunoID,
		matricula.CursoID,
		matricula.DataMatricula,
		numeroMatricula,
		matricula.Status,
	)
	
	if err != nil {
		return 0, "", err
	}
	
	id, err := result.LastInsertId()
	if err != nil {
		return 0, numeroMatricula, err
	}
	
	return int(id), numeroMatricula, nil
}

// GetMatriculasByCurso retorna matrículas de um curso específico
func (r *Repository) GetMatriculasByCurso(cursoID int) ([]models.Matricula, error) {
	query := `SELECT m.id, m.aluno_id, m.curso_id, m.data_matricula, m.numero_matricula,
              m.status, a.nome as aluno_nome
              FROM matriculas m
              JOIN alunos a ON m.aluno_id = a.id
              WHERE m.curso_id = ? AND m.status = 'em_curso'
              ORDER BY a.nome`
	
	rows, err := r.DB.Query(query, cursoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matriculas []models.Matricula
	for rows.Next() {
		var m models.Matricula
		var status sql.NullString

		err := rows.Scan(
			&m.ID, 
			&m.AlunoID,
			&m.CursoID,
			&m.DataMatricula,
			&m.NumeroMatricula,
			&status,
			&m.AlunoNome,
		)
		if err != nil {
			continue
		}

		if status.Valid {
			m.Status = status.String
		}

		matriculas = append(matriculas, m)
	}

	return matriculas, nil
}

// SavePresenca salva um registro de presença
func (r *Repository) SavePresenca(presenca models.PresencaRequest) error {
	query := `INSERT INTO presencas (matricula_id, data_aula, presente)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE presente = VALUES(presente)`
	
	_, err := r.DB.Exec(
		query,
		presenca.MatriculaID,
		presenca.DataAula,
		presenca.Presente,
	)
	
	return err
}

// GetPresencasByMatriculaAndPeriodo retorna registros de presença para uma matrícula em um período
func (r *Repository) GetPresencasByMatriculaAndPeriodo(matriculaID int, mes int, ano int) (map[string]bool, error) {
	// Constrói datas de início e fim do mês
	dataInicio := fmt.Sprintf("%04d-%02d-01", ano, mes)
	var dataFim string
	if mes == 12 {
		dataFim = fmt.Sprintf("%04d-01-01", ano+1)
	} else {
		dataFim = fmt.Sprintf("%04d-%02d-01", ano, mes+1)
	}
	
	query := `SELECT data_aula, presente FROM presencas 
              WHERE matricula_id = ? AND data_aula >= ? AND data_aula < ?`
	
	rows, err := r.DB.Query(query, matriculaID, dataInicio, dataFim)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	presencas := make(map[string]bool)
	for rows.Next() {
		var dataAula string
		var presente bool
		if err := rows.Scan(&dataAula, &presente); err != nil {
			continue
		}
		presencas[dataAula] = presente
	}

	return presencas, nil
}

// Auxiliar para converter strings vazias em NULL para o banco
func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}