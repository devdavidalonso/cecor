-- Script SQL para criação do banco de dados do Sistema de Gestão Educacional
-- Baseado nos modelos Go com suporte para GORM e compatível com o sistema existente

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS=0;

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS educational_management;
USE educational_management;

-- Tabela de usuários (base para alunos, professores, administradores)
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(20) NOT NULL, -- 'admin', 'aluno', 'professor' ou 'student', 'teacher' (para compatibilidade)
    cpf VARCHAR(14) UNIQUE,
    birth_date DATE,
    phone VARCHAR(20),
    address TEXT,
    photo_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Tabela de estudantes
CREATE TABLE students (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'ativo', 'inativo', 'suspenso' ou 'active', 'inactive' (para compatibilidade)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de responsáveis
CREATE TABLE guardians (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    relationship VARCHAR(30), -- 'pai', 'mãe', 'avó', etc. ou 'parent', 'guardian', etc. (para compatibilidade)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Permissões de responsáveis
CREATE TABLE guardian_permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT UNSIGNED NOT NULL,
    pickup_student BOOLEAN DEFAULT FALSE,
    receive_notifications BOOLEAN DEFAULT TRUE,
    authorize_activities BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);

-- Notas sobre estudantes
CREATE TABLE student_notes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    author_id INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Tabela de cursos
CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    workload INT NOT NULL, -- Carga horária em horas
    max_students INT NOT NULL,
    week_days VARCHAR(50), -- Ex: "1,3,5" para segunda, quarta e sexta
    start_time TIME,
    end_time TIME,
    duration INT, -- Duração em semanas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Tabela de matrículas (enrollments)
CREATE TABLE enrollments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'ativa', 'concluida', 'cancelada' ou 'active', 'completed', 'canceled' (para compatibilidade)
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    INDEX (user_id),
    INDEX (course_id)
);

-- Tabela de matrículas (registrations) - mantida para compatibilidade com código existente
CREATE TABLE registrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'completed', 'canceled'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tabela de presenças 
CREATE TABLE attendances (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'partial'
    module VARCHAR(50), -- Módulo específico da aula, se aplicável
    justification TEXT,
    has_attachment BOOLEAN DEFAULT FALSE,
    attachment_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    registered_by_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (registered_by_id) REFERENCES users(id),
    INDEX (date)
);

-- Tabela de presenças simplificada (attendance) - mantida para compatibilidade com código existente
CREATE TABLE attendance (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id INT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'present', 'absent', 'justified'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

-- Tabela de justificativas de ausência
CREATE TABLE absence_justifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    document_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes TEXT,
    submitted_by_id INT UNSIGNED NOT NULL,
    reviewed_by_id INT UNSIGNED,
    review_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (submitted_by_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);

-- Tabela de alertas de ausência
CREATE TABLE absence_alerts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    level INT NOT NULL, -- 1, 2, 3, 4 (progressivo)
    absence_count INT NOT NULL,
    first_absence_date DATE,
    last_absence_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'resolved'
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP NULL,
    resolved_by_id INT UNSIGNED,
    resolution_date TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (resolved_by_id) REFERENCES users(id)
);

-- Tabela de documentos
CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    path VARCHAR(255) NOT NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Tabela de notificações avançadas
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'absence', 'event', 'system', etc.
    channel VARCHAR(20) NOT NULL, -- 'email', 'sms', 'telegram', 'push', 'in-app'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    read BOOLEAN DEFAULT FALSE, -- Mantido para compatibilidade com o sistema existente
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    related_type VARCHAR(30), -- 'absence', 'enrollment', 'course', etc.
    related_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (user_id)
);

-- Tabela de logs de auditoria
CREATE TABLE audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT UNSIGNED NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    old_data JSON,
    new_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de certificados
CREATE TABLE certificates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'conclusao', 'participacao', 'em_curso'
    issue_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NULL,
    certificate_url VARCHAR(255),
    certificate_code VARCHAR(50) UNIQUE, -- Mantida para compatibilidade
    qr_code_url VARCHAR(255),
    verification_code VARCHAR(50) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'revoked', 'expired'
    revocation_reason TEXT,
    pdf_url VARCHAR(255), -- Mantida para compatibilidade
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT UNSIGNED NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX (enrollment_id),
    INDEX (student_id),
    INDEX (course_id)
);

-- Tabela de modelos de certificados
CREATE TABLE certificate_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL, -- 'conclusao', 'participacao', 'em_curso'
    html_content TEXT NOT NULL,
    css_style TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT UNSIGNED NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de formulários
CREATE TABLE forms (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    target_audience VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT UNSIGNED NOT NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de perguntas de formulários
CREATE TABLE form_questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id INT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    help_text TEXT,
    question_type VARCHAR(30) NOT NULL, -- 'text', 'multiple_choice', 'likert', 'file', 'date'
    options TEXT, -- JSON string para opções
    is_required BOOLEAN DEFAULT TRUE,
    display_order INT NOT NULL,
    conditional_parent_id INT UNSIGNED,
    conditional_value VARCHAR(255),
    validation_rules TEXT, -- JSON string para regras de validação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id),
    FOREIGN KEY (conditional_parent_id) REFERENCES form_questions(id)
);

-- Tabela de entrevistas
CREATE TABLE interviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL, -- O entrevistado
    scheduled_date TIMESTAMP NOT NULL,
    interviewer_id INT UNSIGNED,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'canceled', 'rescheduled'
    completion_date TIMESTAMP NULL,
    notes TEXT,
    trigger_type VARCHAR(30), -- 'enrollment', 'periodic'
    related_entity VARCHAR(30),
    related_id INT UNSIGNED,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id)
);

-- Tabela de respostas de formulários
CREATE TABLE form_responses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    interview_id INT UNSIGNED,
    form_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    submission_date TIMESTAMP NOT NULL,
    completion_status VARCHAR(20) NOT NULL DEFAULT 'complete', -- 'complete', 'partial'
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (form_id) REFERENCES forms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de detalhes de respostas
CREATE TABLE form_answer_details (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    response_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    answer_text TEXT,
    answer_options TEXT, -- JSON para múltiplas escolhas
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES form_responses(id),
    FOREIGN KEY (question_id) REFERENCES form_questions(id)
);

-- Tabela de modelos de termos de voluntariado
CREATE TABLE volunteer_term_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT UNSIGNED NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de termos de voluntariado assinados
CREATE TABLE volunteer_terms (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT UNSIGNED NOT NULL,
    template_id INT UNSIGNED NOT NULL,
    signed_at TIMESTAMP NOT NULL,
    expiration_date DATE NOT NULL,
    ip_address VARCHAR(45),
    device_info TEXT,
    signature_type VARCHAR(30) NOT NULL DEFAULT 'digital',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked'
    document_url VARCHAR(255),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT UNSIGNED NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES volunteer_term_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de histórico de termos de voluntariado
CREATE TABLE volunteer_term_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    term_id INT UNSIGNED NOT NULL,
    action_type VARCHAR(30) NOT NULL, -- 'signed', 'viewed', 'expired', 'renewed'
    action_date TIMESTAMP NOT NULL,
    action_by_id INT UNSIGNED,
    details TEXT,
    created_by INT UNSIGNED NOT NULL,
    FOREIGN KEY (term_id) REFERENCES volunteer_terms(id),
    FOREIGN KEY (action_by_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Reativar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS=1;

-- Adiciona um usuário administrador padrão
INSERT INTO users (name, email, password, profile, active) 
VALUES ('Super', 'super@sistema.edu', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'admin', true);
-- Senha hash corresponde a 'admin123'

-- Comentário final
-- Este script cria todas as tabelas necessárias para o Sistema de Gestão Educacional
-- Foi mantida a compatibilidade com o sistema existente enquanto adicionadas as novas funcionalidades
-- O script inclui um usuário administrador padrão