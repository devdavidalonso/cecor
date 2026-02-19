import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface Course {
  id?: number;
  name: string;
  shortDescription?: string;
  detailedDescription?: string;
  coverImage?: string;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  targetAudience?: string;
  prerequisites?: string;
  workload: number; // hours
  maxStudents: number;
  duration: number; // weeks
  weekDays: string; // "Mon,Wed"
  startTime: string; // "19:00"
  endTime: string; // "21:00"
  startDate: Date;
  endDate: Date;
  googleClassroomUrl?: string;
  status: 'active' | 'draft' | 'archived';
  
  // New Fields for Wizard
  category?: string; // Technology, Arts, etc.
  locationId?: number;
  teacherIds?: number[]; // Array of teacher IDs (Titular + Auxiliares)
  
  // Legacy / Transitional
  professorId?: number; // Main professor (to be compatible with existing code)
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: "root",
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

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
    return this.http.get<any[]>(`${environment.apiUrl}/users/teachers`);
  }
}
