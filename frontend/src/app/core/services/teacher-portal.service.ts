// src/app/core/services/teacher-portal.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course } from '../models/course.model';
import { ClassSession } from '../models/class-session.model';

/**
 * Interface para dados do dashboard do professor
 */
export interface TeacherDashboard {
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  todaySessions: TodaySession[];
  weeklyStats: {
    totalStudents: number;
    averageAttendance: number;
    classesGiven: number;
  };
  alerts: TeacherAlert[];
}

/**
 * Sessão de aula de hoje com informações completas
 */
export interface TodaySession extends ClassSession {
  courseName: string;
  courseId: number;
  locationName: string;
  enrolledCount: number;
  attendanceRecorded: boolean;
  googleClassroomId?: string;
  googleClassroomUrl?: string;
}

/**
 * Alerta para o professor
 */
export interface TeacherAlert {
  type: 'low_attendance' | 'incident' | 'meeting' | 'sync';
  title: string;
  description: string;
  actionUrl?: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Curso do professor com informações de sincronização Google
 */
export interface TeacherCourse extends Course {
  enrolledCount: number;
  averageAttendance: number;
  schedule?: string;
  nextSession?: {
    date: string;
    startTime: string;
    topic?: string;
  };
  googleClassroomId?: string;
  googleClassroomUrl?: string;
  googleSyncStatus: 'synced' | 'pending' | 'not_synced' | 'error';
}

/**
 * Aluno matriculado com informações de frequência
 */
export interface CourseStudent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  attendancePercentage: number;
  status: 'active' | 'inactive';
  googleInvitationStatus?: 'pending' | 'accepted' | 'not_sent' | 'error';
  enrollmentId: number;
}

/**
 * Registro de presença
 */
export interface AttendanceRecord {
  studentId: number;
  sessionId: number;
  status: 'present' | 'absent' | 'justified';
  note?: string;
}

/**
 * Ocorrência registrada
 */
export interface Incident {
  id: number;
  type: 'disciplinary' | 'infrastructure' | 'health' | 'other';
  typeLabel: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in_analysis' | 'resolved';
  createdAt: string;
  course?: {
    id: number;
    name: string;
  };
  student?: {
    id: number;
    name: string;
  };
}

/**
 * Serviço para o Portal do Professor
 * Gerencia APIs de dashboard, cursos, presença, ocorrências e integração Google Classroom
 */
@Injectable({
  providedIn: 'root'
})
export class TeacherPortalService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/teacher`;

  // ==================== DASHBOARD ====================

  /**
   * Obtém dados do dashboard do professor logado
   */
  getDashboard(): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.baseUrl}/dashboard`);
  }

  /**
   * Obtém aulas do dia do professor
   */
  getTodaySessions(): Observable<TodaySession[]> {
    return this.http.get<TodaySession[]>(`${this.baseUrl}/sessions/today`);
  }

  // ==================== CURSOS ====================

  /**
   * Obtém lista de cursos do professor logado
   */
  getMyCourses(): Observable<TeacherCourse[]> {
    return this.http.get<TeacherCourse[]>(`${this.baseUrl}/courses`);
  }

  /**
   * Obtém detalhes de um curso específico
   */
  getCourseById(courseId: number): Observable<TeacherCourse> {
    return this.http.get<TeacherCourse>(`${this.baseUrl}/courses/${courseId}`);
  }

  /**
   * Obtém alunos matriculados em um curso
   */
  getCourseStudents(courseId: number): Observable<CourseStudent[]> {
    return this.http.get<CourseStudent[]>(`${this.baseUrl}/courses/${courseId}/students`);
  }

  // ==================== AULAS/SESSÕES ====================

  /**
   * Obtém sessões de aula em um período (para calendário)
   */
  getSessionsByPeriod(start: string, end: string): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(
      `${this.baseUrl}/sessions?start=${start}&end=${end}`
    );
  }

  /**
   * Obtém detalhes de uma sessão específica
   */
  getSessionById(sessionId: number): Observable<ClassSession> {
    return this.http.get<ClassSession>(`${this.baseUrl}/sessions/${sessionId}`);
  }

  // ==================== PRESENÇA ====================

  /**
   * Registra presença em lote para uma aula
   */
  recordAttendance(attendances: AttendanceRecord[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/attendance/batch`, attendances);
  }

  /**
   * Obtém presença já registrada para uma sessão
   */
  getSessionAttendance(sessionId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/attendance/session/${sessionId}`);
  }

  /**
   * Obtém histórico de frequência de um aluno
   */
  getStudentAttendanceHistory(studentId: number, courseId?: number): Observable<any[]> {
    let url = `${this.baseUrl}/students/${studentId}/attendance`;
    if (courseId) {
      url += `?courseId=${courseId}`;
    }
    return this.http.get<any[]>(url);
  }

  // ==================== OCORRÊNCIAS ====================

  /**
   * Obtém ocorrências registradas pelo professor
   */
  getMyIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/incidents`);
  }

  /**
   * Cria nova ocorrência
   */
  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return this.http.post<Incident>(`${this.baseUrl}/incidents`, incident);
  }

  /**
   * Obtém detalhes de uma ocorrência
   */
  getIncidentById(incidentId: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/incidents/${incidentId}`);
  }

  // ==================== PERFIL DO ALUNO ====================

  /**
   * Obtém perfil público de um aluno (visão professor)
   */
  getStudentProfile(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/students/${studentId}/profile`);
  }

  // ==================== INTEGRAÇÃO GOOGLE CLASSROOM ====================

  /**
   * Cria turma no Google Classroom
   */
  createGoogleClassroom(courseId: number): Observable<GoogleClassroomResult> {
    return this.http.post<GoogleClassroomResult>(
      `${this.baseUrl}/courses/${courseId}/classroom/create`, 
      {}
    );
  }

  /**
   * Verifica status de sincronização com Google Classroom
   */
  getClassroomSyncStatus(courseId: number): Observable<GoogleClassroomStatus> {
    return this.http.get<GoogleClassroomStatus>(
      `${this.baseUrl}/courses/${courseId}/classroom/status`
    );
  }

  /**
   * Sincroniza alunos com Google Classroom (envia convites)
   */
  syncStudentsWithClassroom(courseId: number): Observable<StudentSyncResult[]> {
    return this.http.post<StudentSyncResult[]>(
      `${this.baseUrl}/courses/${courseId}/classroom/sync-students`, 
      {}
    );
  }

  /**
   * Envia convite individual para aluno
   */
  sendStudentInvitation(courseId: number, studentId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/courses/${courseId}/students/${studentId}/invite`, 
      {}
    );
  }
}

/**
 * Resultado da criação de turma no Google Classroom
 */
export interface GoogleClassroomResult {
  success: boolean;
  googleClassroomId?: string;
  googleClassroomUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Status de sincronização com Google Classroom
 */
export interface GoogleClassroomStatus {
  courseId: number;
  synced: boolean;
  googleClassroomId?: string;
  googleClassroomUrl?: string;
  lastSyncAt?: string;
  error?: string;
}

/**
 * Resultado da sincronização de um aluno
 */
export interface StudentSyncResult {
  studentId: number;
  studentName: string;
  email: string;
  success: boolean;
  invitationSent: boolean;
  message?: string;
  error?: string;
}
