// src/app/core/models/interview.model.ts

/**
 * Tipos de perguntas suportados no formulário de entrevista
 */
export type QuestionType = 'text' | 'select' | 'boolean' | 'multiple_choice';

/**
 * Representa uma pergunta no formulário
 */
export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

/**
 * Definição do formulário de entrevista (MongoDB)
 */
export interface FormDefinition {
  id?: string;
  title: string;
  version: string;
  description: string;
  isActive: boolean;
  questions: Question[];
  createdAt?: Date;
}

/**
 * Resposta de uma entrevista (MongoDB)
 */
export interface InterviewResponse {
  id?: string;
  studentId: number;
  formVersion: string;
  status: 'pending' | 'completed';
  answers: { [key: string]: any };
  interviewerId?: number;
  completionDate?: Date;
  createdAt?: Date;
}

/**
 * Status da entrevista para um aluno
 */
export interface InterviewStatus {
  hasPendingInterview: boolean;
  studentId: number;
  formId?: string;
  formTitle?: string;
  formVersion?: string;
}

/**
 * Helper para criar ID único de pergunta
 */
export function generateQuestionId(): string {
  return 'q_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Template de perguntas comuns
 */
export const QUESTION_TEMPLATES: Partial<Question>[] = [
  {
    label: 'Você trabalha atualmente?',
    type: 'boolean',
    required: true
  },
  {
    label: 'Qual sua escolaridade?',
    type: 'select',
    options: ['Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo'],
    required: true
  },
  {
    label: 'Qual sua expectativa com o curso?',
    type: 'text',
    placeholder: 'Descreva o que espera aprender...',
    required: false
  },
  {
    label: 'Quais cursos já fez no CECOR?',
    type: 'multiple_choice',
    options: ['Violão', 'Informática', 'Costura', 'Inglês', 'Espanhol', 'Teatro', 'Dança'],
    required: false
  },
  {
    label: 'Renda familiar mensal aproximada?',
    type: 'select',
    options: ['Até 1 salário mínimo', '1 a 2 salários mínimos', '2 a 3 salários mínimos', '3 a 5 salários mínimos', 'Acima de 5 salários mínimos', 'Prefiro não informar'],
    required: false
  },
  {
    label: 'Possui acesso à internet em casa?',
    type: 'boolean',
    required: true
  },
  {
    label: 'Possui computador/notebook em casa?',
    type: 'boolean',
    required: true
  },
  {
    label: 'Como conheceu o CECOR?',
    type: 'select',
    options: ['Indicação de amigo/familiar', 'Redes sociais', 'Escola', 'Igreja', 'Comunidade', 'Outro'],
    required: false
  },
  {
    label: 'Observações adicionais',
    type: 'text',
    placeholder: 'Alguma informação relevante sobre o aluno...',
    required: false
  }
];
