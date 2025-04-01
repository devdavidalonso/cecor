// src/app/core/models/enrollment.model.ts
export interface Enrollment {
    id: number;
    studentId: number;
    courseId: number;
    enrollmentNumber: string;
    status: EnrollmentStatus;
    startDate: Date;
    endDate?: Date;
    enrollmentDate: Date;
    cancellationReason?: string;
    commitmentTermUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum EnrollmentStatus {
    ACTIVE = 'active',
    IN_PROGRESS = 'in_progress',
    SUSPENDED = 'suspended',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
  }