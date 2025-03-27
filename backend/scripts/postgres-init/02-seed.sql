-- Script de população de dados iniciais para o Sistema CECOR
-- Dados de teste para desenvolvimento e demonstração

-- Usuários com diferentes perfis
-- Senha padrão: 'admin123' (hash: $2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li)
INSERT INTO users (name, email, password, profile, cpf, birth_date, phone, active) 
VALUES 
('Administrador Sistema', 'admin@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'admin', '111.111.111-11', '1980-01-01', '(11) 99999-1111', true),
('Gestor Educacional', 'gestor@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'gestor', '222.222.222-22', '1985-02-02', '(11) 99999-2222', true),
('Professor Silva', 'professor.silva@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'professor', '333.333.333-33', '1975-03-03', '(11) 99999-3333', true),
('Professor Oliveira', 'professor.oliveira@cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'professor', '444.444.444-44', '1978-04-04', '(11) 99999-4444', true),
('Maria Estudante', 'maria@aluno.cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'aluno', '555.555.555-55', '2000-05-05', '(11) 99999-5555', true),
('João Estudante', 'joao@aluno.cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'aluno', '666.666.666-66', '2001-06-06', '(11) 99999-6666', true),
('Ana Estudante', 'ana@aluno.cecor.org', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'aluno', '777.777.777-77', '1999-07-07', '(11) 99999-7777', true)
ON CONFLICT (email) DO NOTHING;

-- Registro de estudantes
INSERT INTO students (user_id, registration_number, status)
VALUES 
((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'), '2023001', 'ativo'),
((SELECT id FROM users WHERE email = 'joao@aluno.cecor.org'), '2023002', 'ativo'),
((SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'), '2023003', 'ativo')
ON CONFLICT DO NOTHING;

-- Responsáveis
INSERT INTO guardians (student_id, name, email, phone, cpf, relationship)
VALUES
((SELECT id FROM students WHERE registration_number = '2023001'), 'Carlos Pai', 'carlos@responsavel.com', '(11) 98888-1111', '888.888.888-11', 'pai'),
((SELECT id FROM students WHERE registration_number = '2023001'), 'Sofia Mãe', 'sofia@responsavel.com', '(11) 98888-2222', '888.888.888-22', 'mãe'),
((SELECT id FROM students WHERE registration_number = '2023002'), 'Roberto Pai', 'roberto@responsavel.com', '(11) 98888-3333', '888.888.888-33', 'pai'),
((SELECT id FROM students WHERE registration_number = '2023003'), 'Marta Mãe', 'marta@responsavel.com', '(11) 98888-4444', '888.888.888-44', 'mãe')
ON CONFLICT DO NOTHING;

-- Permissões dos responsáveis
INSERT INTO guardian_permissions (guardian_id, pickup_student, receive_notifications, authorize_activities)
VALUES
((SELECT id FROM guardians WHERE email = 'carlos@responsavel.com'), true, true, true),
((SELECT id FROM guardians WHERE email = 'sofia@responsavel.com'), true, true, true),
((SELECT id FROM guardians WHERE email = 'roberto@responsavel.com'), true, true, false),
((SELECT id FROM guardians WHERE email = 'marta@responsavel.com'), true, true, true)
ON CONFLICT DO NOTHING;

-- Cursos
INSERT INTO courses (name, description, workload, max_students, week_days, start_time, end_time, duration)
VALUES
('Informática Básica', 'Curso introdutório de informática para iniciantes', 40, 20, '1,3,5', '09:00:00', '11:00:00', 10),
('Corte e Costura', 'Aprenda técnicas de corte e costura para iniciantes', 60, 15, '2,4', '14:00:00', '17:00:00', 12),
('Jiu-Jitsu Infantil', 'Aulas de jiu-jitsu para crianças de 8 a 12 anos', 36, 25, '6', '10:00:00', '12:00:00', 12),
('Pintura em Tela', 'Curso de pintura em tela para todas as idades', 48, 15, '3,5', '19:00:00', '21:00:00', 8)
ON CONFLICT DO NOTHING;

-- Associação de professores aos cursos
INSERT INTO teacher_courses (user_id, course_id, role, start_date, active)
VALUES
((SELECT id FROM users WHERE email = 'professor.silva@cecor.org'), (SELECT id FROM courses WHERE name = 'Informática Básica'), 'principal', '2023-01-15', true),
((SELECT id FROM users WHERE email = 'professor.oliveira@cecor.org'), (SELECT id FROM courses WHERE name = 'Corte e Costura'), 'principal', '2023-01-15', true),
((SELECT id FROM users WHERE email = 'professor.silva@cecor.org'), (SELECT id FROM courses WHERE name = 'Jiu-Jitsu Infantil'), 'auxiliar', '2023-01-15', true),
((SELECT id FROM users WHERE email = 'professor.oliveira@cecor.org'), (SELECT id FROM courses WHERE name = 'Pintura em Tela'), 'principal', '2023-01-15', true)
ON CONFLICT DO NOTHING;

-- Matrículas
INSERT INTO enrollments (user_id, course_id, status, start_date)
VALUES
((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'), (SELECT id FROM courses WHERE name = 'Informática Básica'), 'ativa', '2023-02-01'),
((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'), (SELECT id FROM courses WHERE name = 'Corte e Costura'), 'ativa', '2023-02-15'),
((SELECT id FROM users WHERE email = 'joao@aluno.cecor.org'), (SELECT id FROM courses WHERE name = 'Jiu-Jitsu Infantil'), 'ativa', '2023-02-05'),
((SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'), (SELECT id FROM courses WHERE name = 'Pintura em Tela'), 'ativa', '2023-02-10'),
((SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'), (SELECT id FROM courses WHERE name = 'Informática Básica'), 'ativa', '2023-03-01')
ON CONFLICT DO NOTHING;

-- Registros de presença
INSERT INTO attendances (student_id, course_id, date, status, module, notes, registered_by_id)
VALUES
((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'), 
 (SELECT id FROM courses WHERE name = 'Informática Básica'), 
 '2023-03-01', 'present', 'Módulo 1', 'Aluna participativa', 
 (SELECT id FROM users WHERE email = 'professor.silva@cecor.org')),

((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'), 
 (SELECT id FROM courses WHERE name = 'Informática Básica'), 
 '2023-03-03', 'present', 'Módulo 1', 'Bom desempenho', 
 (SELECT id FROM users WHERE email = 'professor.silva@cecor.org')),

((SELECT id FROM users WHERE email = 'joao@aluno.cecor.org'), 
 (SELECT id FROM courses WHERE name = 'Jiu-Jitsu Infantil'), 
 '2023-03-04', 'absent', 'Prática', 'Não compareceu', 
 (SELECT id FROM users WHERE email = 'professor.silva@cecor.org')),

((SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'), 
 (SELECT id FROM courses WHERE name = 'Pintura em Tela'), 
 '2023-03-07', 'present', 'Cores', 'Excelente trabalho', 
 (SELECT id FROM users WHERE email = 'professor.oliveira@cecor.org'))
ON CONFLICT DO NOTHING;

-- Notificações de exemplo
INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, delivery_status)
VALUES
((SELECT id FROM users WHERE email = 'joao@aluno.cecor.org'), 
 'Falta Registrada', 
 'Você teve uma falta registrada na aula de Jiu-Jitsu Infantil do dia 04/03/2023', 
 'absence', 
 'course', 
 (SELECT id FROM courses WHERE name = 'Jiu-Jitsu Infantil'), 
 'delivered'),

((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'), 
 'Boas-vindas', 
 'Bem-vindo ao curso de Informática Básica! As aulas começam em 01/02/2023', 
 'welcome', 
 'course', 
 (SELECT id FROM courses WHERE name = 'Informática Básica'), 
 'delivered'),

((SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'), 
 'Lembrete de Aula', 
 'Lembrete: Amanhã tem aula de Pintura em Tela às 19h', 
 'reminder', 
 'course', 
 (SELECT id FROM courses WHERE name = 'Pintura em Tela'), 
 'pending')
ON CONFLICT DO NOTHING;

-- Formulários
INSERT INTO forms (title, description, type, is_required, target_audience, status, created_by)
VALUES
('Entrevista Inicial', 'Formulário para entrevista inicial de novos alunos', 'interview', true, 'aluno', 'active',
 (SELECT id FROM users WHERE email = 'admin@cecor.org')),
 
('Avaliação de Curso', 'Formulário para avaliar a qualidade do curso', 'feedback', false, 'aluno', 'active',
 (SELECT id FROM users WHERE email = 'gestor@cecor.org')),
 
('Cadastro de Responsáveis', 'Formulário para registro de responsáveis', 'registration', true, 'responsavel', 'active',
 (SELECT id FROM users WHERE email = 'admin@cecor.org'))
ON CONFLICT DO NOTHING;

-- Perguntas dos formulários
INSERT INTO form_questions (form_id, question_text, help_text, question_type, options, is_required, display_order)
VALUES
-- Entrevista Inicial
((SELECT id FROM forms WHERE title = 'Entrevista Inicial'), 
 'Qual seu interesse principal ao se matricular neste curso?', 
 'Explique suas motivações', 
 'text', 
 NULL, 
 true, 
 1),

((SELECT id FROM forms WHERE title = 'Entrevista Inicial'), 
 'Você já teve experiência anterior com este tipo de atividade?', 
 NULL, 
 'multiple_choice', 
 '["Sim, muita experiência", "Sim, alguma experiência", "Não, sou iniciante"]', 
 true, 
 2),

-- Avaliação de Curso
((SELECT id FROM forms WHERE title = 'Avaliação de Curso'), 
 'Como você avalia o conteúdo do curso?', 
 NULL, 
 'likert', 
 '["Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"]', 
 true, 
 1),

((SELECT id FROM forms WHERE title = 'Avaliação de Curso'), 
 'Como você avalia o desempenho do professor?', 
 NULL, 
 'likert', 
 '["Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"]', 
 true, 
 2),

((SELECT id FROM forms WHERE title = 'Avaliação de Curso'), 
 'Sugestões para melhoria do curso', 
 'Compartilhe suas ideias', 
 'text', 
 NULL, 
 false, 
 3),

-- Cadastro de Responsáveis
((SELECT id FROM forms WHERE title = 'Cadastro de Responsáveis'), 
 'Grau de parentesco com o aluno', 
 NULL, 
 'multiple_choice', 
 '["Pai", "Mãe", "Avô/Avó", "Tio/Tia", "Outro"]', 
 true, 
 1),

((SELECT id FROM forms WHERE title = 'Cadastro de Responsáveis'), 
 'Autoriza o aluno a sair sozinho após as aulas?', 
 NULL, 
 'multiple_choice', 
 '["Sim", "Não"]', 
 true, 
 2)
ON CONFLICT DO NOTHING;

-- Entrevistas agendadas
INSERT INTO interviews (form_id, user_id, scheduled_date, interviewer_id, status, trigger_type)
VALUES
((SELECT id FROM forms WHERE title = 'Entrevista Inicial'),
 (SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'),
 '2023-04-15 10:00:00',
 (SELECT id FROM users WHERE email = 'gestor@cecor.org'),
 'scheduled',
 'enrollment'),
 
((SELECT id FROM forms WHERE title = 'Entrevista Inicial'),
 (SELECT id FROM users WHERE email = 'joao@aluno.cecor.org'),
 '2023-04-16 14:00:00',
 (SELECT id FROM users WHERE email = 'gestor@cecor.org'),
 'scheduled',
 'enrollment')
ON CONFLICT DO NOTHING;

-- Modelo de termo de voluntariado
INSERT INTO volunteer_term_templates (title, content, version, is_active, created_by)
VALUES
('Termo de Voluntariado 2023', 
 'Este termo estabelece as condições para o trabalho voluntário no CECOR durante o período de 2023, conforme a Lei do Voluntariado (Lei nº 9.608/98)...',
 '1.0',
 true,
 (SELECT id FROM users WHERE email = 'admin@cecor.org'))
ON CONFLICT DO NOTHING;

-- Termos de voluntariado assinados
INSERT INTO volunteer_terms (teacher_id, template_id, signed_at, expiration_date, signature_type, status, created_by)
VALUES
((SELECT id FROM users WHERE email = 'professor.silva@cecor.org'),
 (SELECT id FROM volunteer_term_templates WHERE version = '1.0'),
 '2023-01-10 09:30:00',
 '2023-12-31',
 'digital',
 'active',
 (SELECT id FROM users WHERE email = 'admin@cecor.org')),
 
((SELECT id FROM users WHERE email = 'professor.oliveira@cecor.org'),
 (SELECT id FROM volunteer_term_templates WHERE version = '1.0'),
 '2023-01-12 14:45:00',
 '2023-12-31',
 'digital',
 'active',
 (SELECT id FROM users WHERE email = 'admin@cecor.org'))
ON CONFLICT DO NOTHING;

-- Perfis de usuários
INSERT INTO user_profiles (user_id, profile_type, is_primary, is_active, scope_type, scope_id, start_date)
VALUES
-- Administrador
((SELECT id FROM users WHERE email = 'admin@cecor.org'),
 'admin',
 true,
 true,
 NULL,
 NULL,
 '2023-01-01'),
 
-- Gestor
((SELECT id FROM users WHERE email = 'gestor@cecor.org'),
 'gestor',
 true,
 true,
 NULL,
 NULL,
 '2023-01-01'),
 
-- Professores
((SELECT id FROM users WHERE email = 'professor.silva@cecor.org'),
 'professor',
 true,
 true,
 'departamento',
 1,
 '2023-01-01'),
 
((SELECT id FROM users WHERE email = 'professor.oliveira@cecor.org'),
 'professor',
 true,
 true,
 'departamento',
 2,
 '2023-01-01'),
 
-- Alunos
((SELECT id FROM users WHERE email = 'maria@aluno.cecor.org'),
 'aluno',
 true,
 true,
 NULL,
 NULL,
 '2023-02-01'),
 
((SELECT id FROM users WHERE email = 'joao@aluno.cecor.org'),
 'aluno',
 true,
 true,
 NULL,
 NULL,
 '2023-02-01'),
 
((SELECT id FROM users WHERE email = 'ana@aluno.cecor.org'),
 'aluno',
 true,
 true,
 NULL,
 NULL,
 '2023-02-01')
ON CONFLICT DO NOTHING;

-- Comentário final
COMMENT ON DATABASE educational_management IS 'Sistema de Gestão Educacional CECOR';