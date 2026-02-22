// src/app/core/services/student-portal.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentDashboard {
  student: StudentInfo;
  todaySessions: TodaySession[];
  courses: StudentCourse[];
  alerts: StudentAlert[];
  stats: StudentStats;
}

export interface StudentInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface TodaySession {
  id: number;
  courseName: string;
  courseClassName: string;
  location: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  hasAttendance: boolean;
}

export interface StudentCourse {
  id: number;
  name: string;
  classCode: string;
  teacherName: string;
  location: string;
  schedule: string;
  attendancePercent: number;
  totalSessions: number;
  attendedSessions: number;
  status: string;
  nextSession?: string;
}

export interface StudentAlert {
  type: 'low_attendance' | 'incident' | 'info';
  title: string;
  description: string;
  actionUrl: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StudentStats {
  totalCourses: number;
  averageAttendance: number;
  totalIncidents: number;
}

export interface AttendanceRecord {
  date: string;
  dayOfWeek: string;
  status: 'present' | 'absent' | 'justified' | 'not_recorded';
  topic: string;
}

export interface CourseAttendance {
  courseName: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  attendancePercent: number;
  records: AttendanceRecord[];
}

export interface StudentProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address?: Address;
  specialNeeds?: string;
  medicalInfo?: string;
  createdAt: string;
}

export interface Address {
  id?: number;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Incident {
  id: number;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  courseName?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentPortalService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/student`;

  /**
   * Obtém o dashboard do aluno logado
   */
  getDashboard(): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`${this.baseUrl}/dashboard`);
  }

  /**
   * Lista os cursos do aluno
   */
  getMyCourses(): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.baseUrl}/courses`);
  }

  /**
   * Obtém o histórico de frequência de um curso
   */
  getCourseAttendance(courseId: number): Observable<CourseAttendance> {
    return this.http.get<CourseAttendance>(`${this.baseUrl}/courses/${courseId}/attendance`);
  }

  /**
   * Lista as ocorrências do aluno
   */
  getMyIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/incidents`);
  }

  /**
   * Obtém o perfil do aluno
   */
  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.baseUrl}/profile`);
  }

  /**
   * Atualiza dados de contato do perfil
   */
  updateProfile(data: { phone: string; email: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/profile`, data);
  }

  /**
   * Helper para formatar porcentagem de frequência
   */
  getAttendanceColor(percent: number): string {
    if (percent >= 90) return '#4caf50'; // Verde
    if (percent >= 75) return '#ff9800'; // Laranja
    return '#f44336'; // Vermelho
  }

  /**
   * Helper para status de frequência
   */
  getAttendanceLabel(percent: number): string {
    if (percent >= 90) return 'Excelente';
    if (percent >= 75) return 'Boa';
    if (percent >= 60) return 'Regular';
    return 'Crítica';
  }
}
