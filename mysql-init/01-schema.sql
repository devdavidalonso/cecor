-- Users table (students, teachers, admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(20) NOT NULL, -- 'admin', 'student', 'teacher'
    birth_date DATE NULL,         -- Alterado para permitir NULL
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    photo_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL     -- Campo para soft delete
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    workload INTEGER NOT NULL,
    max_students INTEGER NOT NULL,
    week_days VARCHAR(50),        -- JSON or string with days
    start_time TIME,
    end_time TIME,
    duration INTEGER,             -- in weeks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL     -- Campo para soft delete
);

-- Enrollments table
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'active', 'completed', 'canceled'
    start_date DATE,
    end_date DATE NULL,           -- Pode ser NULL se não finalizado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,    -- Campo para soft delete
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Add a default admin user
INSERT INTO users (name, email, password, profile, active) 
VALUES ('Administrator', 'admin@sistema.edu', '$2a$10$QZx8Jp2FRtNdqMJ.mQQMxuKY7HcHB3acjQk6wFjTQwAGQdOUmm6Li', 'admin', true);
-- Senha hash corresponde a 'admin123'