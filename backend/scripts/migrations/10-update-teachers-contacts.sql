-- 10-update-teachers-contacts.sql

-- 1. Atualizar Tabela Teachers (Adicionar campos de voluntariado)
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS academic_background TEXT,
ADD COLUMN IF NOT EXISTS proficiencies TEXT; -- Pode ser JSONB no futuro se precisar de estrutura

COMMENT ON COLUMN public.teachers.academic_background IS 'Formação acadêmica do voluntário/professor';
COMMENT ON COLUMN public.teachers.proficiencies IS 'Lista de competências e proficiências';

-- 2. Generalizar Tabela Guardians para UserContacts
-- Renomear tabela (se ainda não foi feito, garantindo idempotência)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guardians') THEN
        ALTER TABLE public.guardians RENAME TO user_contacts;
    END IF;
END $$;

-- Adicionar user_id para vincular a qualquer usuário (ex: Professor)
ALTER TABLE public.user_contacts
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES public.users(id);

-- Tornar student_id opcional (pois agora pode ser contato de um professor, não só de aluno)
ALTER TABLE public.user_contacts
ALTER COLUMN student_id DROP NOT NULL;

COMMENT ON TABLE public.user_contacts IS 'Centraliza contatos de emergência (Professores) e responsáveis (Alunos)';

-- 3. Criar Tabelas de Termos de Voluntariado (Lei 9.608/98)
CREATE TABLE IF NOT EXISTS public.volunteer_term_templates (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.volunteer_terms (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id),
    template_id INTEGER NOT NULL REFERENCES public.volunteer_term_templates(id),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.volunteer_terms IS 'Registros de aceies da Lei de Voluntariado';
