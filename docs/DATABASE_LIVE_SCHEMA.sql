--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12
-- Dumped by pg_dump version 15.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: student_status; Type: TYPE; Schema: public; Owner: cecor
--

CREATE TYPE public.student_status AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE public.student_status OWNER TO cecor;

--
-- Name: generate_registration_number(); Type: FUNCTION; Schema: public; Owner: cecor
--

CREATE FUNCTION public.generate_registration_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
    year_prefix VARCHAR(4);
    max_sequence INTEGER;
    new_sequence VARCHAR(6);
    new_registration VARCHAR(10);
BEGIN
    -- Obter ano atual
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Buscar maior sequencial do ano atual
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(registration_number FROM 5 FOR 6) AS INTEGER)
    ), 0)
    INTO max_sequence
    FROM students
    WHERE registration_number LIKE year_prefix || '%'
    AND LENGTH(registration_number) = 10
    AND registration_number ~ '^[0-9]{10}$';
    
    -- Incrementar sequencial
    new_sequence := LPAD((max_sequence + 1)::TEXT, 6, '0');
    
    -- Montar número completo
    new_registration := year_prefix || new_sequence;
    
    RETURN new_registration;
END;
$_$;


ALTER FUNCTION public.generate_registration_number() OWNER TO cecor;

--
-- Name: FUNCTION generate_registration_number(); Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON FUNCTION public.generate_registration_number() IS 'Gera próximo número de matrícula baseado no ano atual e sequencial';


--
-- Name: trigger_generate_registration_number(); Type: FUNCTION; Schema: public; Owner: cecor
--

CREATE FUNCTION public.trigger_generate_registration_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Gerar número apenas se não foi fornecido
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := generate_registration_number();
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_generate_registration_number() OWNER TO cecor;

--
-- Name: update_teachers_updated_at(); Type: FUNCTION; Schema: public; Owner: cecor
--

CREATE FUNCTION public.update_teachers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_teachers_updated_at() OWNER TO cecor;

--
-- Name: validate_student_status_change(); Type: FUNCTION; Schema: public; Owner: cecor
--

CREATE FUNCTION public.validate_student_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Exemplo: registrar em log quando status mudar para suspended
    IF NEW.status = 'suspended' AND OLD.status != 'suspended' THEN
        -- Aqui poderia inserir em uma tabela de audit_logs
        RAISE NOTICE 'Aluno % foi suspenso', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_student_status_change() OWNER TO cecor;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: absence_alerts; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.absence_alerts (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    course_id bigint NOT NULL,
    level bigint NOT NULL,
    absence_count bigint NOT NULL,
    first_absence_date timestamp with time zone,
    last_absence_date timestamp with time zone,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    notification_sent boolean DEFAULT false,
    notification_date timestamp without time zone,
    resolved_by_id bigint,
    resolution_date timestamp without time zone,
    resolution_notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.absence_alerts OWNER TO cecor;

--
-- Name: absence_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.absence_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.absence_alerts_id_seq OWNER TO cecor;

--
-- Name: absence_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.absence_alerts_id_seq OWNED BY public.absence_alerts.id;


--
-- Name: absence_justifications; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.absence_justifications (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    course_id bigint NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    reason text NOT NULL,
    document_url text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    submitted_by_id bigint NOT NULL,
    reviewed_by_id bigint,
    review_date timestamp without time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.absence_justifications OWNER TO cecor;

--
-- Name: absence_justifications_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.absence_justifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.absence_justifications_id_seq OWNER TO cecor;

--
-- Name: absence_justifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.absence_justifications_id_seq OWNED BY public.absence_justifications.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    cep character varying(10),
    street character varying(255),
    number character varying(20),
    complement character varying(100),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(2),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.addresses OWNER TO cecor;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.addresses_id_seq OWNER TO cecor;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    registration_id integer NOT NULL,
    date date NOT NULL,
    status character varying(20) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.attendance OWNER TO cecor;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attendance_id_seq OWNER TO cecor;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.attendances (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    course_id bigint NOT NULL,
    date timestamp with time zone NOT NULL,
    status text NOT NULL,
    module text,
    justification text,
    has_attachment boolean DEFAULT false,
    attachment_url text,
    notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    registered_by_id bigint NOT NULL,
    enrollment_id bigint
);


ALTER TABLE public.attendances OWNER TO cecor;

--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attendances_id_seq OWNER TO cecor;

--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id bigint NOT NULL,
    action text NOT NULL,
    user_id bigint NOT NULL,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone
);


ALTER TABLE public.audit_logs OWNER TO cecor;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO cecor;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: certificate_templates; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.certificate_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    html_content text NOT NULL,
    css_style text,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by integer NOT NULL,
    css_styles text,
    created_by_id bigint NOT NULL
);


ALTER TABLE public.certificate_templates OWNER TO cecor;

--
-- Name: certificate_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.certificate_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certificate_templates_id_seq OWNER TO cecor;

--
-- Name: certificate_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.certificate_templates_id_seq OWNED BY public.certificate_templates.id;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    enrollment_id bigint NOT NULL,
    student_id bigint NOT NULL,
    course_id bigint NOT NULL,
    type text NOT NULL,
    issue_date timestamp without time zone NOT NULL,
    expiry_date timestamp without time zone,
    certificate_url text,
    certificate_code character varying(50),
    qr_code_url text,
    verification_code text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    revocation_reason text,
    pdf_url character varying(255),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by integer NOT NULL,
    created_by_id bigint NOT NULL
);


ALTER TABLE public.certificates OWNER TO cecor;

--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certificates_id_seq OWNER TO cecor;

--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    workload bigint NOT NULL,
    max_students bigint NOT NULL,
    week_days text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    duration bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp without time zone,
    short_description text,
    cover_image text,
    detailed_description text,
    prerequisites text,
    difficulty_level text,
    target_audience text,
    tags json,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL
);


ALTER TABLE public.courses OWNER TO cecor;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.courses_id_seq OWNER TO cecor;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    path text NOT NULL,
    uploaded_by integer NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    uploaded_by_id bigint NOT NULL
);


ALTER TABLE public.documents OWNER TO cecor;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.documents_id_seq OWNER TO cecor;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    course_id bigint NOT NULL,
    status character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    enrollment_number text,
    enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cancellation_reason text,
    agreement_url character varying(255)
);


ALTER TABLE public.enrollments OWNER TO cecor;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.enrollments_id_seq OWNER TO cecor;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: form_answer_details; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.form_answer_details (
    id integer NOT NULL,
    response_id bigint NOT NULL,
    question_id bigint NOT NULL,
    answer_text text,
    answer_options text,
    file_url text,
    created_at timestamp with time zone
);


ALTER TABLE public.form_answer_details OWNER TO cecor;

--
-- Name: form_answer_details_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.form_answer_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_answer_details_id_seq OWNER TO cecor;

--
-- Name: form_answer_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.form_answer_details_id_seq OWNED BY public.form_answer_details.id;


--
-- Name: form_questions; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.form_questions (
    id integer NOT NULL,
    form_id bigint NOT NULL,
    question_text text NOT NULL,
    help_text text,
    question_type text NOT NULL,
    options text,
    is_required boolean DEFAULT true,
    display_order bigint NOT NULL,
    conditional_parent_id bigint,
    conditional_value text,
    validation_rules text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.form_questions OWNER TO cecor;

--
-- Name: form_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.form_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_questions_id_seq OWNER TO cecor;

--
-- Name: form_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.form_questions_id_seq OWNED BY public.form_questions.id;


--
-- Name: form_responses; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.form_responses (
    id integer NOT NULL,
    interview_id bigint,
    form_id bigint NOT NULL,
    user_id bigint NOT NULL,
    submission_date timestamp without time zone NOT NULL,
    completion_status character varying(20) DEFAULT 'complete'::character varying NOT NULL,
    ip_address text,
    created_at timestamp with time zone
);


ALTER TABLE public.form_responses OWNER TO cecor;

--
-- Name: form_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.form_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_responses_id_seq OWNER TO cecor;

--
-- Name: form_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.form_responses_id_seq OWNED BY public.form_responses.id;


--
-- Name: forms; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.forms (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    type text NOT NULL,
    is_required boolean DEFAULT false,
    target_audience text NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by integer NOT NULL,
    deleted_at timestamp without time zone,
    created_by_id bigint NOT NULL
);


ALTER TABLE public.forms OWNER TO cecor;

--
-- Name: forms_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.forms_id_seq OWNER TO cecor;

--
-- Name: forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;


--
-- Name: guardian_permissions; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.guardian_permissions (
    id integer NOT NULL,
    guardian_id bigint NOT NULL,
    pickup_student boolean DEFAULT false,
    receive_notifications boolean DEFAULT true,
    authorize_activities boolean DEFAULT false
);


ALTER TABLE public.guardian_permissions OWNER TO cecor;

--
-- Name: guardian_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.guardian_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guardian_permissions_id_seq OWNER TO cecor;

--
-- Name: guardian_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.guardian_permissions_id_seq OWNED BY public.guardian_permissions.id;


--
-- Name: guardians; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.guardians (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    cpf text,
    relationship text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp without time zone,
    can_pickup boolean DEFAULT false,
    receive_notifications boolean DEFAULT true,
    authorize_activities boolean DEFAULT false,
    user_id bigint
);


ALTER TABLE public.guardians OWNER TO cecor;

--
-- Name: guardians_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.guardians_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guardians_id_seq OWNER TO cecor;

--
-- Name: guardians_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.guardians_id_seq OWNED BY public.guardians.id;


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    form_id bigint NOT NULL,
    user_id bigint NOT NULL,
    scheduled_date timestamp without time zone NOT NULL,
    interviewer_id bigint,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    completion_date timestamp without time zone,
    notes text,
    trigger_type text,
    related_entity text,
    related_id bigint,
    reminder_sent boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.interviews OWNER TO cecor;

--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.interviews_id_seq OWNER TO cecor;

--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    entity_type text,
    entity_id bigint,
    delivery_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    delivery_attempt integer DEFAULT 0 NOT NULL,
    last_attempt_at timestamp without time zone,
    delivered_at timestamp without time zone,
    read_at timestamp without time zone,
    error_message text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    delivery_attempts bigint DEFAULT 0 NOT NULL,
    last_attempt_date timestamp with time zone,
    delivery_date timestamp with time zone,
    read_date timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO cecor;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO cecor;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    course_id bigint NOT NULL,
    status text NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.registrations OWNER TO cecor;

--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registrations_id_seq OWNER TO cecor;

--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: student_notes; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.student_notes (
    id integer NOT NULL,
    student_id bigint NOT NULL,
    author_id bigint NOT NULL,
    content text NOT NULL,
    is_confidential boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.student_notes OWNER TO cecor;

--
-- Name: student_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.student_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_notes_id_seq OWNER TO cecor;

--
-- Name: student_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.student_notes_id_seq OWNED BY public.student_notes.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.students (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    registration_number text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp without time zone,
    special_needs text,
    medical_info text,
    social_media json,
    notes text,
    status public.student_status DEFAULT 'active'::public.student_status NOT NULL
);


ALTER TABLE public.students OWNER TO cecor;

--
-- Name: COLUMN students.registration_number; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.students.registration_number IS 'Número de matrícula gerado automaticamente no formato YYYYNNNNNN (ex: 2025000001)';


--
-- Name: COLUMN students.status; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.students.status IS 'Status do aluno: active (ativo), inactive (inativo), suspended (suspenso)';


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_id_seq OWNER TO cecor;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: teacher_courses; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.teacher_courses (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    course_id bigint NOT NULL,
    role text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    active boolean DEFAULT true,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    teacher_id integer
);


ALTER TABLE public.teacher_courses OWNER TO cecor;

--
-- Name: COLUMN teacher_courses.teacher_id; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.teacher_courses.teacher_id IS 'Referência ao professor na tabela teachers';


--
-- Name: teacher_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.teacher_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teacher_courses_id_seq OWNER TO cecor;

--
-- Name: teacher_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.teacher_courses_id_seq OWNED BY public.teacher_courses.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    specialization text,
    bio text,
    phone character varying(20),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teachers OWNER TO cecor;

--
-- Name: TABLE teachers; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON TABLE public.teachers IS 'Tabela de professores do sistema';


--
-- Name: COLUMN teachers.user_id; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.teachers.user_id IS 'Referência ao usuário na tabela users';


--
-- Name: COLUMN teachers.specialization; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.teachers.specialization IS 'Área de especialização do professor';


--
-- Name: COLUMN teachers.bio; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.teachers.bio IS 'Biografia/apresentação do professor';


--
-- Name: COLUMN teachers.phone; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.teachers.phone IS 'Telefone de contato do professor';


--
-- Name: COLUMN teachers.active; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.teachers.active IS 'Indica se o professor está ativo no sistema';


--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachers_id_seq OWNER TO cecor;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    profile_type text NOT NULL,
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    scope_type text,
    scope_id bigint,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.user_profiles OWNER TO cecor;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_profiles_id_seq OWNER TO cecor;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    cpf text,
    birth_date timestamp with time zone,
    phone text,
    photo_url text,
    active boolean DEFAULT true,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp without time zone,
    last_login timestamp with time zone,
    reset_token text,
    token_expiration timestamp with time zone,
    keycloak_user_id text,
    profile_id integer DEFAULT 3 NOT NULL
);


ALTER TABLE public.users OWNER TO cecor;

--
-- Name: COLUMN users.profile_id; Type: COMMENT; Schema: public; Owner: cecor
--

COMMENT ON COLUMN public.users.profile_id IS 'Referência ao perfil do usuário (admin=1, professor=2, student=3)';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO cecor;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: volunteer_term_history; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.volunteer_term_history (
    id integer NOT NULL,
    term_id bigint NOT NULL,
    action_type text NOT NULL,
    action_date timestamp without time zone NOT NULL,
    action_by_id bigint,
    details text,
    created_by integer NOT NULL,
    created_by_id bigint NOT NULL
);


ALTER TABLE public.volunteer_term_history OWNER TO cecor;

--
-- Name: volunteer_term_history_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.volunteer_term_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.volunteer_term_history_id_seq OWNER TO cecor;

--
-- Name: volunteer_term_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.volunteer_term_history_id_seq OWNED BY public.volunteer_term_history.id;


--
-- Name: volunteer_term_templates; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.volunteer_term_templates (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    version text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by integer NOT NULL,
    created_by_id bigint NOT NULL
);


ALTER TABLE public.volunteer_term_templates OWNER TO cecor;

--
-- Name: volunteer_term_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.volunteer_term_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.volunteer_term_templates_id_seq OWNER TO cecor;

--
-- Name: volunteer_term_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.volunteer_term_templates_id_seq OWNED BY public.volunteer_term_templates.id;


--
-- Name: volunteer_terms; Type: TABLE; Schema: public; Owner: cecor
--

CREATE TABLE public.volunteer_terms (
    id integer NOT NULL,
    teacher_id bigint NOT NULL,
    template_id bigint NOT NULL,
    signed_at timestamp without time zone NOT NULL,
    expiration_date timestamp with time zone NOT NULL,
    ip_address text,
    device_info text,
    signature_type character varying(30) DEFAULT 'digital'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    document_url text,
    reminder_sent boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by integer NOT NULL,
    created_by_id bigint NOT NULL
);


ALTER TABLE public.volunteer_terms OWNER TO cecor;

--
-- Name: volunteer_terms_id_seq; Type: SEQUENCE; Schema: public; Owner: cecor
--

CREATE SEQUENCE public.volunteer_terms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.volunteer_terms_id_seq OWNER TO cecor;

--
-- Name: volunteer_terms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cecor
--

ALTER SEQUENCE public.volunteer_terms_id_seq OWNED BY public.volunteer_terms.id;


--
-- Name: absence_alerts id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_alerts ALTER COLUMN id SET DEFAULT nextval('public.absence_alerts_id_seq'::regclass);


--
-- Name: absence_justifications id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_justifications ALTER COLUMN id SET DEFAULT nextval('public.absence_justifications_id_seq'::regclass);


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: certificate_templates id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificate_templates ALTER COLUMN id SET DEFAULT nextval('public.certificate_templates_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: form_answer_details id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_answer_details ALTER COLUMN id SET DEFAULT nextval('public.form_answer_details_id_seq'::regclass);


--
-- Name: form_questions id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_questions ALTER COLUMN id SET DEFAULT nextval('public.form_questions_id_seq'::regclass);


--
-- Name: form_responses id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses ALTER COLUMN id SET DEFAULT nextval('public.form_responses_id_seq'::regclass);


--
-- Name: forms id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);


--
-- Name: guardian_permissions id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardian_permissions ALTER COLUMN id SET DEFAULT nextval('public.guardian_permissions_id_seq'::regclass);


--
-- Name: guardians id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardians ALTER COLUMN id SET DEFAULT nextval('public.guardians_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: student_notes id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.student_notes ALTER COLUMN id SET DEFAULT nextval('public.student_notes_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: teacher_courses id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teacher_courses ALTER COLUMN id SET DEFAULT nextval('public.teacher_courses_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: volunteer_term_history id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history ALTER COLUMN id SET DEFAULT nextval('public.volunteer_term_history_id_seq'::regclass);


--
-- Name: volunteer_term_templates id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_templates ALTER COLUMN id SET DEFAULT nextval('public.volunteer_term_templates_id_seq'::regclass);


--
-- Name: volunteer_terms id; Type: DEFAULT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms ALTER COLUMN id SET DEFAULT nextval('public.volunteer_terms_id_seq'::regclass);


--
-- Name: absence_alerts absence_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_alerts
    ADD CONSTRAINT absence_alerts_pkey PRIMARY KEY (id);


--
-- Name: absence_justifications absence_justifications_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_justifications
    ADD CONSTRAINT absence_justifications_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: certificate_templates certificate_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_certificate_code_key; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_code_key UNIQUE (certificate_code);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_verification_code_key; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_verification_code_key UNIQUE (verification_code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: form_answer_details form_answer_details_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_answer_details
    ADD CONSTRAINT form_answer_details_pkey PRIMARY KEY (id);


--
-- Name: form_questions form_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT form_questions_pkey PRIMARY KEY (id);


--
-- Name: form_responses form_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_pkey PRIMARY KEY (id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: guardian_permissions guardian_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardian_permissions
    ADD CONSTRAINT guardian_permissions_pkey PRIMARY KEY (id);


--
-- Name: guardians guardians_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: student_notes student_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.student_notes
    ADD CONSTRAINT student_notes_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_registration_number_unique; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_registration_number_unique UNIQUE (registration_number);


--
-- Name: teacher_courses teacher_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teacher_courses
    ADD CONSTRAINT teacher_courses_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);


--
-- Name: addresses uni_addresses_user_id; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT uni_addresses_user_id UNIQUE (user_id);


--
-- Name: students uni_students_registration_number; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uni_students_registration_number UNIQUE (registration_number);


--
-- Name: students uni_students_user_id; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uni_students_user_id UNIQUE (user_id);


--
-- Name: users uni_users_keycloak_user_id; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uni_users_keycloak_user_id UNIQUE (keycloak_user_id);


--
-- Name: teacher_courses unique_teacher_course_role; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teacher_courses
    ADD CONSTRAINT unique_teacher_course_role UNIQUE (user_id, course_id, role);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: users users_cpf_key; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_cpf_key UNIQUE (cpf);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: volunteer_term_history volunteer_term_history_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT volunteer_term_history_pkey PRIMARY KEY (id);


--
-- Name: volunteer_term_templates volunteer_term_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_templates
    ADD CONSTRAINT volunteer_term_templates_pkey PRIMARY KEY (id);


--
-- Name: volunteer_terms volunteer_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT volunteer_terms_pkey PRIMARY KEY (id);


--
-- Name: attendances_date_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX attendances_date_idx ON public.attendances USING btree (date);


--
-- Name: certificates_course_id_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX certificates_course_id_idx ON public.certificates USING btree (course_id);


--
-- Name: certificates_enrollment_id_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX certificates_enrollment_id_idx ON public.certificates USING btree (enrollment_id);


--
-- Name: certificates_student_id_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX certificates_student_id_idx ON public.certificates USING btree (student_id);


--
-- Name: enrollments_course_id_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX enrollments_course_id_idx ON public.enrollments USING btree (course_id);


--
-- Name: enrollments_student_id_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX enrollments_student_id_idx ON public.enrollments USING btree (student_id);


--
-- Name: idx_absence_alerts_course_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_absence_alerts_course_id ON public.absence_alerts USING btree (course_id);


--
-- Name: idx_absence_alerts_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_absence_alerts_student_id ON public.absence_alerts USING btree (student_id);


--
-- Name: idx_absence_justifications_course_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_absence_justifications_course_id ON public.absence_justifications USING btree (course_id);


--
-- Name: idx_absence_justifications_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_absence_justifications_student_id ON public.absence_justifications USING btree (student_id);


--
-- Name: idx_addresses_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_addresses_deleted_at ON public.addresses USING btree (deleted_at);


--
-- Name: idx_addresses_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);


--
-- Name: idx_attendances_course_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_attendances_course_id ON public.attendances USING btree (course_id);


--
-- Name: idx_attendances_date; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_attendances_date ON public.attendances USING btree (date);


--
-- Name: idx_attendances_enrollment_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_attendances_enrollment_id ON public.attendances USING btree (enrollment_id);


--
-- Name: idx_attendances_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_attendances_student_id ON public.attendances USING btree (student_id);


--
-- Name: idx_certificates_course_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_certificates_course_id ON public.certificates USING btree (course_id);


--
-- Name: idx_certificates_enrollment_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_certificates_enrollment_id ON public.certificates USING btree (enrollment_id);


--
-- Name: idx_certificates_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_certificates_student_id ON public.certificates USING btree (student_id);


--
-- Name: idx_courses_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_courses_deleted_at ON public.courses USING btree (deleted_at);


--
-- Name: idx_documents_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_documents_student_id ON public.documents USING btree (student_id);


--
-- Name: idx_form_answer_details_response_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_form_answer_details_response_id ON public.form_answer_details USING btree (response_id);


--
-- Name: idx_form_questions_form_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_form_questions_form_id ON public.form_questions USING btree (form_id);


--
-- Name: idx_forms_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_forms_deleted_at ON public.forms USING btree (deleted_at);


--
-- Name: idx_guardian_permissions_guardian_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_guardian_permissions_guardian_id ON public.guardian_permissions USING btree (guardian_id);


--
-- Name: idx_guardians_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_guardians_deleted_at ON public.guardians USING btree (deleted_at);


--
-- Name: idx_guardians_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_guardians_student_id ON public.guardians USING btree (student_id);


--
-- Name: idx_interviews_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_interviews_user_id ON public.interviews USING btree (user_id);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_registrations_course_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_registrations_course_id ON public.registrations USING btree (course_id);


--
-- Name: idx_registrations_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_registrations_deleted_at ON public.registrations USING btree (deleted_at);


--
-- Name: idx_registrations_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_registrations_student_id ON public.registrations USING btree (student_id);


--
-- Name: idx_student_notes_student_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_student_notes_student_id ON public.student_notes USING btree (student_id);


--
-- Name: idx_students_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_students_deleted_at ON public.students USING btree (deleted_at);


--
-- Name: idx_students_registration_number; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_students_registration_number ON public.students USING btree (registration_number);


--
-- Name: idx_students_status; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_students_status ON public.students USING btree (status);


--
-- Name: idx_students_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_students_user_id ON public.students USING btree (user_id);


--
-- Name: idx_teacher_courses_course_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_teacher_courses_course_id ON public.teacher_courses USING btree (course_id);


--
-- Name: idx_teacher_courses_teacher_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_teacher_courses_teacher_id ON public.teacher_courses USING btree (teacher_id);


--
-- Name: idx_teacher_courses_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_teacher_courses_user_id ON public.teacher_courses USING btree (user_id);


--
-- Name: idx_teachers_active; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_teachers_active ON public.teachers USING btree (active);


--
-- Name: idx_teachers_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_teachers_user_id ON public.teachers USING btree (user_id);


--
-- Name: idx_user_profiles_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_keycloak_user_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_users_keycloak_user_id ON public.users USING btree (keycloak_user_id);


--
-- Name: idx_users_profile_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_users_profile_id ON public.users USING btree (profile_id);


--
-- Name: idx_volunteer_term_history_term_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_volunteer_term_history_term_id ON public.volunteer_term_history USING btree (term_id);


--
-- Name: idx_volunteer_terms_teacher_id; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX idx_volunteer_terms_teacher_id ON public.volunteer_terms USING btree (teacher_id);


--
-- Name: notifications_delivery_status_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX notifications_delivery_status_idx ON public.notifications USING btree (delivery_status);


--
-- Name: notifications_entity_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX notifications_entity_idx ON public.notifications USING btree (entity_type, entity_id);


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: user_profiles_scope_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX user_profiles_scope_idx ON public.user_profiles USING btree (scope_type, scope_id);


--
-- Name: user_profiles_user_profile_idx; Type: INDEX; Schema: public; Owner: cecor
--

CREATE INDEX user_profiles_user_profile_idx ON public.user_profiles USING btree (user_id, profile_type);


--
-- Name: students before_insert_student_registration; Type: TRIGGER; Schema: public; Owner: cecor
--

CREATE TRIGGER before_insert_student_registration BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_registration_number();


--
-- Name: teachers trigger_teachers_updated_at; Type: TRIGGER; Schema: public; Owner: cecor
--

CREATE TRIGGER trigger_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_teachers_updated_at();


--
-- Name: students trigger_validate_student_status; Type: TRIGGER; Schema: public; Owner: cecor
--

CREATE TRIGGER trigger_validate_student_status BEFORE UPDATE OF status ON public.students FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.validate_student_status_change();


--
-- Name: absence_alerts absence_alerts_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_alerts
    ADD CONSTRAINT absence_alerts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: absence_alerts absence_alerts_resolved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_alerts
    ADD CONSTRAINT absence_alerts_resolved_by_id_fkey FOREIGN KEY (resolved_by_id) REFERENCES public.users(id);


--
-- Name: absence_alerts absence_alerts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_alerts
    ADD CONSTRAINT absence_alerts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: absence_justifications absence_justifications_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_justifications
    ADD CONSTRAINT absence_justifications_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: absence_justifications absence_justifications_reviewed_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_justifications
    ADD CONSTRAINT absence_justifications_reviewed_by_id_fkey FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id);


--
-- Name: absence_justifications absence_justifications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_justifications
    ADD CONSTRAINT absence_justifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: absence_justifications absence_justifications_submitted_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.absence_justifications
    ADD CONSTRAINT absence_justifications_submitted_by_id_fkey FOREIGN KEY (submitted_by_id) REFERENCES public.users(id);


--
-- Name: attendance attendance_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id);


--
-- Name: attendances attendances_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: attendances attendances_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: attendances attendances_registered_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_registered_by_id_fkey FOREIGN KEY (registered_by_id) REFERENCES public.users(id);


--
-- Name: attendances attendances_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: certificate_templates certificate_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: certificates certificates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: certificates certificates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: certificates certificates_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: certificates certificates_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: documents documents_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: audit_logs fk_audit_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: form_answer_details fk_form_answer_details_question; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_answer_details
    ADD CONSTRAINT fk_form_answer_details_question FOREIGN KEY (question_id) REFERENCES public.form_questions(id);


--
-- Name: form_questions fk_form_questions_conditional_parent; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT fk_form_questions_conditional_parent FOREIGN KEY (conditional_parent_id) REFERENCES public.form_questions(id);


--
-- Name: form_answer_details fk_form_responses_answer_details; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_answer_details
    ADD CONSTRAINT fk_form_responses_answer_details FOREIGN KEY (response_id) REFERENCES public.form_responses(id);


--
-- Name: form_responses fk_form_responses_form; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT fk_form_responses_form FOREIGN KEY (form_id) REFERENCES public.forms(id);


--
-- Name: form_responses fk_form_responses_interview; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT fk_form_responses_interview FOREIGN KEY (interview_id) REFERENCES public.interviews(id);


--
-- Name: form_responses fk_form_responses_user; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT fk_form_responses_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forms fk_forms_created_by; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_created_by FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: form_questions fk_forms_questions; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT fk_forms_questions FOREIGN KEY (form_id) REFERENCES public.forms(id);


--
-- Name: guardian_permissions fk_guardian_permissions_guardian; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardian_permissions
    ADD CONSTRAINT fk_guardian_permissions_guardian FOREIGN KEY (guardian_id) REFERENCES public.guardians(id);


--
-- Name: interviews fk_interviews_form; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_form FOREIGN KEY (form_id) REFERENCES public.forms(id);


--
-- Name: interviews fk_interviews_interviewer; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_interviewer FOREIGN KEY (interviewer_id) REFERENCES public.users(id);


--
-- Name: interviews fk_interviews_user; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: registrations fk_registrations_course; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT fk_registrations_course FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: registrations fk_registrations_student; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT fk_registrations_student FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_notes fk_student_notes_author; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.student_notes
    ADD CONSTRAINT fk_student_notes_author FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: documents fk_students_documents; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_students_documents FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: guardians fk_students_guardians; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT fk_students_guardians FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_notes fk_students_student_notes; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.student_notes
    ADD CONSTRAINT fk_students_student_notes FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: students fk_students_user; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: teacher_courses fk_teacher_courses_teacher_id; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teacher_courses
    ADD CONSTRAINT fk_teacher_courses_teacher_id FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE;


--
-- Name: teachers fk_teachers_user_id; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT fk_teachers_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles fk_user_profiles_user; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: addresses fk_users_address; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk_users_address FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users fk_users_profile_id; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_profile_id FOREIGN KEY (profile_id) REFERENCES public.user_profiles(id) ON DELETE RESTRICT;


--
-- Name: volunteer_term_history fk_volunteer_term_history_action_by; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT fk_volunteer_term_history_action_by FOREIGN KEY (action_by_id) REFERENCES public.users(id);


--
-- Name: volunteer_term_history fk_volunteer_term_history_created_by; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT fk_volunteer_term_history_created_by FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: volunteer_term_templates fk_volunteer_term_templates_created_by; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_templates
    ADD CONSTRAINT fk_volunteer_term_templates_created_by FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: volunteer_terms fk_volunteer_terms_created_by; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT fk_volunteer_terms_created_by FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: volunteer_term_history fk_volunteer_terms_history; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT fk_volunteer_terms_history FOREIGN KEY (term_id) REFERENCES public.volunteer_terms(id);


--
-- Name: volunteer_terms fk_volunteer_terms_teacher; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT fk_volunteer_terms_teacher FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: volunteer_terms fk_volunteer_terms_template; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT fk_volunteer_terms_template FOREIGN KEY (template_id) REFERENCES public.volunteer_term_templates(id);


--
-- Name: form_answer_details form_answer_details_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_answer_details
    ADD CONSTRAINT form_answer_details_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.form_questions(id);


--
-- Name: form_answer_details form_answer_details_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_answer_details
    ADD CONSTRAINT form_answer_details_response_id_fkey FOREIGN KEY (response_id) REFERENCES public.form_responses(id);


--
-- Name: form_questions form_questions_conditional_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT form_questions_conditional_parent_id_fkey FOREIGN KEY (conditional_parent_id) REFERENCES public.form_questions(id);


--
-- Name: form_questions form_questions_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_questions
    ADD CONSTRAINT form_questions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id);


--
-- Name: form_responses form_responses_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id);


--
-- Name: form_responses form_responses_interview_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interviews(id);


--
-- Name: form_responses form_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forms forms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: guardian_permissions guardian_permissions_guardian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardian_permissions
    ADD CONSTRAINT guardian_permissions_guardian_id_fkey FOREIGN KEY (guardian_id) REFERENCES public.guardians(id);


--
-- Name: guardians guardians_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: interviews interviews_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id);


--
-- Name: interviews interviews_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.users(id);


--
-- Name: interviews interviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: registrations registrations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: registrations registrations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_notes student_notes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.student_notes
    ADD CONSTRAINT student_notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: student_notes student_notes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.student_notes
    ADD CONSTRAINT student_notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: teacher_courses teacher_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teacher_courses
    ADD CONSTRAINT teacher_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: teacher_courses teacher_courses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.teacher_courses
    ADD CONSTRAINT teacher_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: volunteer_term_history volunteer_term_history_action_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT volunteer_term_history_action_by_id_fkey FOREIGN KEY (action_by_id) REFERENCES public.users(id);


--
-- Name: volunteer_term_history volunteer_term_history_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT volunteer_term_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: volunteer_term_history volunteer_term_history_term_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_history
    ADD CONSTRAINT volunteer_term_history_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.volunteer_terms(id);


--
-- Name: volunteer_term_templates volunteer_term_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_term_templates
    ADD CONSTRAINT volunteer_term_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: volunteer_terms volunteer_terms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT volunteer_terms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: volunteer_terms volunteer_terms_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT volunteer_terms_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- Name: volunteer_terms volunteer_terms_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cecor
--

ALTER TABLE ONLY public.volunteer_terms
    ADD CONSTRAINT volunteer_terms_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.volunteer_term_templates(id);


--
-- PostgreSQL database dump complete
--

