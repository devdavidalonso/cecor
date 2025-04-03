-- Script de população de dados iniciais para o Sistema CECOR

-- Limpar dados existentes (opcional, use com cuidado)
-- TRUNCATE TABLE users, students, guardians CASCADE;

-- Inserir usuários com senhas hasheadas (bcrypt)
-- Senha padrão: 'cecor2024!' 
-- Hash gerado com: $2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li
INSERT INTO users (
    name, 
    email, 
    password, 
    profile, 
    cpf, 
    birth_date, 
    phone, 
    address, 
    active
) VALUES 
-- Administradores
('Maria Silva', 'maria.silva@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'admin', '123.456.789-00', '1980-05-15', '(11) 98765-4321', 'Rua Principal, 100 - São Paulo, SP', true),
('João Santos', 'joao.santos@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'admin', '987.654.321-00', '1975-08-20', '(11) 97654-3210', 'Av. Central, 250 - São Paulo, SP', true),

-- Gestores
('Ana Oliveira', 'ana.oliveira@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'gestor', '456.789.123-00', '1985-03-10', '(11) 96543-2109', 'Rua das Flores, 75 - São Paulo, SP', true),

-- Professores
('Carlos Ferreira', 'carlos.ferreira@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'professor', '234.567.891-00', '1990-11-25', '(11) 95432-1098', 'Rua dos Professores, 50 - São Paulo, SP', true),
('Mariana Costa', 'mariana.costa@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'professor', '345.678.912-00', '1988-07-12', '(11) 94321-0987', 'Av. Educação, 200 - São Paulo, SP', true),

-- Alunos
('Pedro Almeida', 'pedro.almeida@exemplo.com', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'aluno', '567.890.123-00', '2005-09-18', '(11) 93210-9876', 'Rua do Estudante, 30 - São Paulo, SP', true),
('Ana Clara Souza', 'ana.clara@exemplo.com', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'aluno', '678.901.234-00', '2006-12-05', '(11) 92109-8765', 'Rua da Juventude, 45 - São Paulo, SP', true),
('Lucas Rodrigues', 'lucas.rodrigues@exemplo.com', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'aluno', '789.012.345-00', '2004-06-22', '(11) 91098-7654', 'Av. dos Sonhos, 120 - São Paulo, SP', true);

-- Inserir perfis de usuários
INSERT INTO user_profiles (
    user_id, 
    profile_type, 
    is_primary, 
    is_active, 
    start_date
) VALUES 
-- Administradores
((SELECT id FROM users WHERE email = 'maria.silva@cecor.org'), 'admin', true, true, CURRENT_DATE),
((SELECT id FROM users WHERE email = 'joao.santos@cecor.org'), 'admin', true, true, CURRENT_DATE),

-- Gestores
((SELECT id FROM users WHERE email = 'ana.oliveira@cecor.org'), 'gestor', true, true, CURRENT_DATE),

-- Professores
((SELECT id FROM users WHERE email = 'carlos.ferreira@cecor.org'), 'professor', true, true, CURRENT_DATE),
((SELECT id FROM users WHERE email = 'mariana.costa@cecor.org'), 'professor', true, true, CURRENT_DATE),

-- Alunos
((SELECT id FROM users WHERE email = 'pedro.almeida@exemplo.com'), 'aluno', true, true, CURRENT_DATE),
((SELECT id FROM users WHERE email = 'ana.clara@exemplo.com'), 'aluno', true, true, CURRENT_DATE),
((SELECT id FROM users WHERE email = 'lucas.rodrigues@exemplo.com'), 'aluno', true, true, CURRENT_DATE);

-- Inserir estudantes
INSERT INTO students (
    user_id, 
    registration_number, 
    status
) VALUES 
((SELECT id FROM users WHERE email = 'pedro.almeida@exemplo.com'), '2024001', 'ativo'),
((SELECT id FROM users WHERE email = 'ana.clara@exemplo.com'), '2024002', 'ativo'),
((SELECT id FROM users WHERE email = 'lucas.rodrigues@exemplo.com'), '2024003', 'ativo');

-- Inserir responsáveis
INSERT INTO guardians (
    student_id, 
    name, 
    email, 
    phone, 
    cpf, 
    relationship
) VALUES 
((SELECT id FROM students WHERE registration_number = '2024001'), 'Roberto Almeida', 'roberto.almeida@exemplo.com', '(11) 99887-7665', '111.222.333-44', 'pai'),
((SELECT id FROM students WHERE registration_number = '2024002'), 'Claudia Souza', 'claudia.souza@exemplo.com', '(11) 98876-6554', '222.333.444-55', 'mãe'),
((SELECT id FROM students WHERE registration_number = '2024003'), 'Marcos Rodrigues', 'marcos.rodrigues@exemplo.com', '(11) 97765-5443', '333.444.555-66', 'pai');

-- Inserir permissões de responsáveis
INSERT INTO guardian_permissions (
    guardian_id, 
    pickup_student, 
    receive_notifications, 
    authorize_activities
) VALUES 
((SELECT id FROM guardians WHERE cpf = '111.222.333-44'), true, true, true),
((SELECT id FROM guardians WHERE cpf = '222.333.444-55'), true, true, true),
((SELECT id FROM guardians WHERE cpf = '333.444.555-66'), true, true, true);

-- Inserir cursos
INSERT INTO courses (
    name, 
    description, 
    workload, 
    max_students, 
    week_days, 
    start_time, 
    end_time, 
    duration
) VALUES 
('Informática Básica', 'Curso introdutório de informática para iniciantes', 40, 20, '1,3,5', '09:00:00', '11:00:00', 10),
('Corte e Costura', 'Aprenda técnicas de corte e costura para iniciantes', 60, 15, '2,4', '14:00:00', '17:00:00', 12),
('Jiu-Jitsu Infantil', 'Aulas de jiu-jitsu para crianças de 8 a 12 anos', 36, 25, '6', '10:00:00', '12:00:00', 12);

-- Associação de professores aos cursos
INSERT INTO teacher_courses (
    user_id, 
    course_id, 
    role, 
    start_date, 
    active
) VALUES 
((SELECT id FROM users WHERE email = 'carlos.ferreira@cecor.org'), 
 (SELECT id FROM courses WHERE name = 'Informática Básica'), 
 'principal', CURRENT_DATE, true),
((SELECT id FROM users WHERE email = 'mariana.costa@cecor.org'), 
 (SELECT id FROM courses WHERE name = 'Corte e Costura'), 
 'principal', CURRENT_DATE, true);

-- Inserir matrículas
INSERT INTO enrollments (
    student_id, 
    course_id, 
    status, 
    start_date
) VALUES 
((SELECT id FROM students WHERE registration_number = '2024001'), 
 (SELECT id FROM courses WHERE name = 'Informática Básica'), 
 'ativa', CURRENT_DATE),
((SELECT id FROM students WHERE registration_number = '2024002'), 
 (SELECT id FROM courses WHERE name = 'Corte e Costura'), 
 'ativa', CURRENT_DATE),
((SELECT id FROM students WHERE registration_number = '2024003'), 
 (SELECT id FROM courses WHERE name = 'Jiu-Jitsu Infantil'), 
 'ativa', CURRENT_DATE);

-- Inserir presenças
INSERT INTO attendances (
    student_id, 
    course_id, 
    date, 
    status, 
    module, 
    registered_by_id
) VALUES 
((SELECT id FROM users WHERE email = 'pedro.almeida@exemplo.com'), 
 (SELECT id FROM courses WHERE name = 'Informática Básica'), 
 CURRENT_DATE, 'present', 'Módulo Introdutório', 
 (SELECT id FROM users WHERE email = 'carlos.ferreira@cecor.org')),
((SELECT id FROM users WHERE email = 'ana.clara@exemplo.com'), 
 (SELECT id FROM courses WHERE name = 'Corte e Costura'), 
 CURRENT_DATE, 'present', 'Módulo Básico', 
 (SELECT id FROM users WHERE email = 'mariana.costa@cecor.org'));

-- Inserir notificações
INSERT INTO notifications (
    user_id, 
    title, 
    message, 
    type, 
    entity_type, 
    delivery_status
) VALUES 
((SELECT id FROM users WHERE email = 'pedro.almeida@exemplo.com'), 
 'Bem-vindo ao Curso', 
 'Você foi matriculado no curso de Informática Básica', 
 'enrollment', 
 'course', 
 'delivered'),
((SELECT id FROM users WHERE email = 'ana.clara@exemplo.com'), 
 'Primeira Aula', 
 'Sua primeira aula de Corte e Costura será hoje', 
 'event', 
 'course', 
 'delivered');

-- Comentário final
COMMENT ON DATABASE educational_management IS 'Sistema de Gestão Educacional CECOR - Dados de Exemplo';