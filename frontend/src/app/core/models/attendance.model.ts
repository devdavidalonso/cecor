// src/app/core/models/attendance.model.ts
export interface Attendance {
    id: number;
    studentId: number;
    courseId: number;
    date: Date;
    status: AttendanceStatus;
    module?: string;
    justification?: string;
    hasAttachment: boolean;
    attachmentUrl?: string;
    notes?: string;
    registeredById: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    PARTIAL = 'partial'
  }
  
  export interface AbsenceJustification {
    id: number;
    studentId: number;
    courseId: number;
    startDate: Date;
    endDate: Date;
    reason: string;
    documentUrl?: string;
    status: JustificationStatus;
    notes?: string;
    submittedById: number;
    reviewedById?: number;
    reviewDate?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum JustificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
  }
  
  export interface AbsenceAlert {
    id: number;
    studentId: number;
    courseId: number;
    level: number;
    absenceCount: number;
    firstAbsenceDate: Date;
    lastAbsenceDate: Date;
    status: AlertStatus;
    notificationSent: boolean;
    notificationDate?: Date;
    resolvedById?: number;
    resolutionDate?: Date;
    resolutionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum AlertStatus {
    OPEN = 'open',
    RESOLVED = 'resolved'
  }
  
  export interface AttendanceFilters {
    courseId?: number;
    studentId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
  }