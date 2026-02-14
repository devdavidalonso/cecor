-- Script SQL para criação do banco de dados do Sistema de Gestão Educacional
-- Adaptado para PostgreSQL a partir do script MySQL original

-- Tabela de usuários (base para alunos, professores, administradores)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(20) NOT NULL, -- 'admin', 'aluno', 'professor' ou 'student', 'teacher' (para compatibilidade)
    cpf VARCHAR(14) UNIQUE,
    birth_date DATE,
    phone VARCHAR(20),
    photo_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Tabela de estudantes
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'ativo', 'inativo', 'suspenso' ou 'active', 'inactive' (para compatibilidade)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de endereços (nova)
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    cep VARCHAR(10),
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de responsáveis
CREATE TABLE IF NOT EXISTS guardians (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    relationship VARCHAR(30), -- 'pai', 'mãe', 'avó', etc. ou 'parent', 'guardian', etc. (para compatibilidade)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Permissões de responsáveis
CREATE TABLE IF NOT EXISTS guardian_permissions (
    id SERIAL PRIMARY KEY,
    guardian_id INTEGER NOT NULL,
    pickup_student BOOLEAN DEFAULT FALSE,
    receive_notifications BOOLEAN DEFAULT TRUE,
    authorize_activities BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);

-- Notas sobre estudantes
CREATE TABLE IF NOT EXISTS student_notes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    workload INTEGER NOT NULL, -- Carga horária em horas
    max_students INTEGER NOT NULL,
    week_days VARCHAR(50), -- Ex: "1,3,5" para segunda, quarta e sexta
    start_time TIME,
    end_time TIME,
    duration INTEGER, -- Duração em semanas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Tabela de matrículas (enrollments)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'ativa', 'concluida', 'cancelada' ou 'active', 'completed', 'canceled' (para compatibilidade)
    enrollment_number VARCHAR(255) NOT NULL UNIQUE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE,
    cancellation_reason TEXT,
    agreement_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE INDEX enrollments_student_id_idx ON enrollments(student_id);
CREATE INDEX enrollments_course_id_idx ON enrollments(course_id);

-- Tabela de matrículas (registrations) - mantida para compatibilidade com código existente
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'completed', 'canceled'
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tabela de presenças 
CREATE TABLE IF NOT EXISTS attendances (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    enrollment_id INTEGER REFERENCES enrollments(id),
    course_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'partial'
    module VARCHAR(50), -- Módulo específico da aula, se aplicável
    justification TEXT,
    has_attachment BOOLEAN DEFAULT FALSE,
    attachment_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by_id INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (registered_by_id) REFERENCES users(id)
);
CREATE INDEX attendances_date_idx ON attendances(date);

-- Tabela de presenças simplificada (attendance) - mantida para compatibilidade com código existente
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'present', 'absent', 'justified'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

-- Tabela de justificativas de ausência
CREATE TABLE IF NOT EXISTS absence_justifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    document_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes TEXT,
    submitted_by_id INTEGER NOT NULL,
    reviewed_by_id INTEGER,
    review_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (submitted_by_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);

-- Tabela de alertas de ausência
CREATE TABLE IF NOT EXISTS absence_alerts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    level INTEGER NOT NULL, -- 1, 2, 3, 4 (progressivo)
    absence_count INTEGER NOT NULL,
    first_absence_date DATE,
    last_absence_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'resolved'
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP NULL,
    resolved_by_id INTEGER,
    resolution_date TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (resolved_by_id) REFERENCES users(id)
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    path VARCHAR(255) NOT NULL,
    uploaded_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Tabela de notificações avançadas
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'absence', 'event', 'system', etc.
    entity_type VARCHAR(30), -- 'student', 'course', 'enrollment', etc.
    entity_id INTEGER,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'failed'
    delivery_attempt INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_delivery_status_idx ON notifications(delivery_status);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_entity_idx ON notifications(entity_type, entity_id);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de certificados
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX certificates_enrollment_id_idx ON certificates(enrollment_id);
CREATE INDEX certificates_student_id_idx ON certificates(student_id);
CREATE INDEX certificates_course_id_idx ON certificates(course_id);

-- Tabela de modelos de certificados
CREATE TABLE IF NOT EXISTS certificate_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL, -- 'conclusao', 'participacao', 'em_curso'
    html_content TEXT NOT NULL,
    css_style TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de formulários
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    target_audience VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de perguntas de formulários
CREATE TABLE IF NOT EXISTS form_questions (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    help_text TEXT,
    question_type VARCHAR(30) NOT NULL, -- 'text', 'multiple_choice', 'likert', 'file', 'date'
    options TEXT, -- JSON string para opções
    is_required BOOLEAN DEFAULT TRUE,
    display_order INTEGER NOT NULL,
    conditional_parent_id INTEGER,
    conditional_value VARCHAR(255),
    validation_rules TEXT, -- JSON string para regras de validação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id),
    FOREIGN KEY (conditional_parent_id) REFERENCES form_questions(id)
);

-- Tabela de entrevistas
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- O entrevistado
    scheduled_date TIMESTAMP NOT NULL,
    interviewer_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'canceled', 'rescheduled'
    completion_date TIMESTAMP NULL,
    notes TEXT,
    trigger_type VARCHAR(30), -- 'enrollment', 'periodic'
    related_entity VARCHAR(30),
    related_id INTEGER,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id)
);

-- Tabela de respostas de formulários
CREATE TABLE IF NOT EXISTS form_responses (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER,
    form_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    submission_date TIMESTAMP NOT NULL,
    completion_status VARCHAR(20) NOT NULL DEFAULT 'complete', -- 'complete', 'partial'
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (form_id) REFERENCES forms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de detalhes de respostas
CREATE TABLE IF NOT EXISTS form_answer_details (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    answer_options TEXT, -- JSON para múltiplas escolhas
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES form_responses(id),
    FOREIGN KEY (question_id) REFERENCES form_questions(id)
);

-- Tabela de modelos de termos de voluntariado
CREATE TABLE IF NOT EXISTS volunteer_term_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de termos de voluntariado assinados
CREATE TABLE IF NOT EXISTS volunteer_terms (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    signed_at TIMESTAMP NOT NULL,
    expiration_date DATE NOT NULL,
    ip_address VARCHAR(45),
    device_info TEXT,
    signature_type VARCHAR(30) NOT NULL DEFAULT 'digital',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked'
    document_url VARCHAR(255),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES volunteer_term_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de histórico de termos de voluntariado
CREATE TABLE IF NOT EXISTS volunteer_term_history (
    id SERIAL PRIMARY KEY,
    term_id INTEGER NOT NULL,
    action_type VARCHAR(30) NOT NULL, -- 'signed', 'viewed', 'expired', 'renewed'
    action_date TIMESTAMP NOT NULL,
    action_by_id INTEGER,
    details TEXT,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (term_id) REFERENCES volunteer_terms(id),
    FOREIGN KEY (action_by_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de perfis de usuários (nova)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    profile_type VARCHAR(20) NOT NULL, -- 'admin', 'gestor', 'professor', 'aluno', 'responsavel', etc.
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    scope_type VARCHAR(30), -- 'curso', 'departamento', etc.
    scope_id INTEGER, -- ID do escopo (ex: ID do curso)
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX user_profiles_user_profile_idx ON user_profiles(user_id, profile_type);
CREATE INDEX user_profiles_scope_idx ON user_profiles(scope_type, scope_id);

-- Tabela de associação professor-curso (nova)
CREATE TABLE IF NOT EXISTS teacher_courses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'principal', 'auxiliar', 'substituto'
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT unique_teacher_course_role UNIQUE (user_id, course_id, role)
);