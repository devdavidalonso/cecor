import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface Course {
  id?: number;
  name: string;
  shortDescription?: string;
  coverImage?: string;
  detailedDescription?: string;
  workload: number;
  maxStudents: number;
  prerequisites?: string;
  difficultyLevel?: string;
  targetAudience?: string;
  tags?: string; // JSON string
  weekDays: string;
  startTime: string;
  endTime: string;
  duration: number; // in weeks
  startDate?: Date;
  endDate?: Date;
  status: string;
  professorId?: string; // Keycloak User ID
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: "root",
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProfessors(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/usuarios/professores`);
  }
}
