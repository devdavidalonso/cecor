USE cecor_db;

-- Tabela de alunos
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(100),
    telefone VARCHAR(20),
    observacao TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de responsáveis
CREATE TABLE responsaveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    aluno_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

-- Tabela de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    dia_semana VARCHAR(20),
    horario_inicio TIME,
    horario_fim TIME,
    professor1 VARCHAR(100),
    professor2 VARCHAR(100),
    professor3 VARCHAR(100),
    professor4 VARCHAR(100),
    professor5 VARCHAR(100),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de matrículas
CREATE TABLE matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    curso_id INT NOT NULL,
    data_matricula DATE NOT NULL,
    numero_matricula VARCHAR(20) UNIQUE,
    status ENUM('em_curso', 'trancada', 'concluida', 'cancelada') DEFAULT 'em_curso',
    tipo_certificado ENUM('conclusao', 'participacao', 'em_curso', 'nenhum') DEFAULT 'nenhum',
    observacoes TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- Inserir dados de teste
INSERT INTO cursos (nome, descricao, dia_semana, horario_inicio, horario_fim, professor1) 
VALUES 
('Corte e Costura', 'Curso básico de corte e costura', 'Segunda-feira', '14:00', '16:00', 'Maria Silva'),
('Pintura', 'Técnicas de pintura em tela', 'Quarta-feira', '09:00', '11:00', 'João Santos'),
('Jiu-jitsu', 'Aulas de jiu-jitsu para iniciantes', 'Sábado', '15:00', '17:00', 'Carlos Oliveira');