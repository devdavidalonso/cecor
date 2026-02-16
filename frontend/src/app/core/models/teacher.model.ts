// src/app/core/models/teacher.model.ts

/**
 * Teacher model - New
 */
export interface Teacher {
  id?: number;
  userId: number;
  specialization?: string;
  bio?: string;
  phone?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  courses?: {
    id: number;
    name: string;
  }[];
}

/**
 * CreateTeacherRequest - Used to create a teacher
 */
export interface CreateTeacherRequest {
  userId: number;
  specialization?: string;
  bio?: string;
  phone?: string;
}

/**
 * TeacherCourse - Association between teacher and course
 */
export interface TeacherCourse {
  id?: number;
  teacherId: number;
  courseId: number;
  role?: string; // "primary", "assistant", "substitute"
  startDate?: string;
  endDate?: string;
  active?: boolean;
}
