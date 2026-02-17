-- 12-create-incidents.sql

-- Criar ENUM para tipos de ocorrência (se PostgreSQL suportar, senão usar check constraint)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_type') THEN
        CREATE TYPE incident_type AS ENUM ('behavioral', 'infrastructure', 'accident', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_severity') THEN
        CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END $$;

-- Criar Tabela de Ocorrências
CREATE TABLE IF NOT EXISTS public.incidents (
    id SERIAL PRIMARY KEY,
    reported_by_id BIGINT NOT NULL REFERENCES public.users(id), -- Quem relatou (Monitor, Prof)
    class_session_id BIGINT REFERENCES public.class_sessions(id), -- Opcional: Contexto da aula
    location_id INTEGER REFERENCES public.locations(id), -- Opcional: Onde ocorreu (se não for em aula)
    
    type incident_type NOT NULL DEFAULT 'other',
    severity incident_severity NOT NULL DEFAULT 'low',
    
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution_notes TEXT,
    
    involved_students JSONB, -- Lista de IDs de alunos envolvidos (flexível)
    
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.incidents IS 'Registro de ocorrências disciplinares ou de infraestrutura';
