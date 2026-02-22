// src/app/core/models/enrollment.model.ts

export interface Enrollment {
  id?: number;
  studentId: number;
  courseId: number;
  enrollmentNumber?: string;
  status: 'active' | 'pending_interview' | 'waiting_list' | 'inactive' | 'completed';
  startDate: Date;
  endDate?: Date;
  enrollmentDate?: Date;
  cancellationReason?: string;
  agreementUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Campos adicionais do backend
  interviewRequired?: boolean;
  interviewFormId?: string;
  interviewFormTitle?: string;
  nextStep?: string;
  redirectUrl?: string;
  
  // Relacionamentos
  student?: {
    id: number;
    name: string;
    email: string;
  };
  course?: {
    id: number;
    name: string;
  };
}

export interface EnrollmentFilters {
  studentId?: number;
  courseId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateEnrollmentRequest {
  studentId: number;
  courseId: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EnrollmentWizardStep {
  step: 'student_selection' | 'course_selection' | 'review' | 'interview' | 'confirmation';
  title: string;
  description: string;
  isComplete: boolean;
}
