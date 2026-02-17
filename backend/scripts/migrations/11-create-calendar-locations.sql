-- 11-create-calendar-locations.sql

-- 1. Criar Tabela de Locais (Salas/Espaços)
CREATE TABLE IF NOT EXISTS public.locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER,
    resources TEXT, -- Ex: "Projetor, Pia, Espelhos"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.locations IS 'Salas de aula e espaços físicos da ONG';

-- 2. Criar Calendário Acadêmico (Feriados e Eventos)
CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    is_school_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.academic_calendar IS 'Feriados e eventos globais da instituição';

-- 3. Criar Sessões de Aula (O Cronograma Real)
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id SERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES public.courses(id),
    location_id INTEGER REFERENCES public.locations(id), -- Pode ser null se ainda não definido
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    topic TEXT, -- A Ementa do Dia
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.class_sessions IS 'Materialização das aulas (Sessões) para controle de frequência e conteúdo';
COMMENT ON COLUMN public.class_sessions.topic IS 'Conteúdo ministrado no dia (Ementa Executada)';

-- 4. Atualizar Attendances para vincular à Sessão (Opcional por enquanto, para não quebrar contrato imediato)
-- Idealmente: ALTER TABLE public.attendances ADD COLUMN class_session_id BIGINT REFERENCES public.class_sessions(id);
