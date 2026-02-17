-- 13-add-classroom-url.sql

-- Adicionar coluna Google Classroom URL na tabela Courses
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS google_classroom_url TEXT;

COMMENT ON COLUMN public.courses.google_classroom_url IS 'Link direto para a turma no Google Classroom';
