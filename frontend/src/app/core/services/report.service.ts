import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CourseAttendanceStats {
  StudentID: number;
  StudentName: string;
  TotalClasses: number;
  PresentCount: number;
  AbsentCount: number;
  AttendanceRate: number;
}

export interface StudentAttendanceStats {
  CourseID: number;
  CourseName: string;
  TotalClasses: number;
  PresentCount: number;
  AbsentCount: number;
  AttendanceRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  getCourseAttendanceReport(courseId: number, startDate?: string, endDate?: string): Observable<CourseAttendanceStats[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<CourseAttendanceStats[]>(`${this.apiUrl}/frequencia/curso/${courseId}`, { params });
  }

  getStudentAttendanceReport(studentId: number, startDate?: string, endDate?: string): Observable<StudentAttendanceStats[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<StudentAttendanceStats[]>(`${this.apiUrl}/frequencia/aluno/${studentId}`, { params });
  }
}