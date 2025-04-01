import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Student, Guardian } from '@core/models/student.model';
import { PaginatedResponse } from '@core/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class StudentMockService {
  private students: Student[] = [
    {
      id: 1,
      name: 'Maria Silva',
      email: 'maria@example.com',
      birthDate: new Date('2000-05-15'),
      cpf: '123.456.789-00',
      mainPhone: '(11) 98765-4321',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      photoUrl: 'https://placekitten.com/100/100',
      status: 'active',
      registrationNumber: '2023001',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: 2,
      name: 'João Santos',
      email: 'joao@example.com',
      birthDate: new Date('2001-08-20'),
      cpf: '987.654.321-00',
      mainPhone: '(11) 91234-5678',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      status: 'active',
      registrationNumber: '2023002',
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date('2023-01-20')
    },
    {
      id: 3,
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      birthDate: new Date('1999-03-10'),
      cpf: '111.222.333-44',
      mainPhone: '(11) 99876-5432',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      medicalInfo: 'Asthma, requires inhaler',
      status: 'active',
      registrationNumber: '2023003',
      createdAt: new Date('2023-02-05'),
      updatedAt: new Date('2023-02-05')
    }
  ];
  
  private guardians: Guardian[] = [
    {
      id: 1,
      studentId: 1,
      name: 'Carlos Silva',
      email: 'carlos@example.com',
      cpf: '222.333.444-55',
      relationship: 'Father',
      phones: [
        { number: '(11) 97777-8888', type: 'personal' }
      ],
      permissions: {
        pickupStudent: true,
        receiveNotifications: true,
        authorizeActivities: true
      }
    },
    {
      id: 2,
      studentId: 1,
      name: 'Sofia Silva',
      email: 'sofia@example.com',
      cpf: '333.444.555-66',
      relationship: 'Mother',
      phones: [
        { number: '(11) 96666-7777', type: 'personal' },
        { number: '(11) 5555-6666', type: 'work' }
      ],
      permissions: {
        pickupStudent: true,
        receiveNotifications: true,
        authorizeActivities: true
      }
    },
    {
      id: 3,
      studentId: 2,
      name: 'Roberto Santos',
      email: 'roberto@example.com',
      cpf: '444.555.666-77',
      relationship: 'Father',
      phones: [
        { number: '(11) 95555-4444', type: 'personal' }
      ],
      permissions: {
        pickupStudent: true,
        receiveNotifications: true,
        authorizeActivities: false
      }
    }
  ];
  
  private documents = [
    {
      id: 1,
      studentId: 1,
      name: 'ID Card',
      type: 'Identification',
      path: '/documents/1/id_card.pdf',
      createdAt: new Date('2023-01-20'),
      uploadedById: 1
    },
    {
      id: 2,
      studentId: 1,
      name: 'Medical Certificate',
      type: 'Medical',
      path: '/documents/1/medical_certificate.pdf',
      createdAt: new Date('2023-02-10'),
      uploadedById: 1
    },
    {
      id: 3,
      studentId: 2,
      name: 'School Record',
      type: 'Academic',
      path: '/documents/2/school_record.pdf',
      createdAt: new Date('2023-01-25'),
      uploadedById: 1
    }
  ];
  
  private notes = [
    {
      id: 1,
      studentId: 1,
      authorId: 1,
      authorName: 'Admin User',
      content: 'Student showed excellent progress in the first month.',
      isConfidential: false,
      createdAt: new Date('2023-02-01')
    },
    {
      id: 2,
      studentId: 1,
      authorId: 2,
      authorName: 'Teacher Silva',
      content: 'Discussing potential need for special attention in mathematics.',
      isConfidential: true,
      createdAt: new Date('2023-02-15')
    },
    {
      id: 3,
      studentId: 2,
      authorId: 1,
      authorName: 'Admin User',
      content: 'Enrollment confirmed with special scholarship.',
      isConfidential: false,
      createdAt: new Date('2023-01-25')
    }
  ];
  
  getStudents(page: number = 1, pageSize: number = 20, filters?: any): Observable<PaginatedResponse<Student>> {
    // Apply filters
    let filteredStudents = [...this.students];
    
    if (filters) {
      if (filters.name) {
        filteredStudents = filteredStudents.filter(s => 
          s.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      
      if (filters.email) {
        filteredStudents = filteredStudents.filter(s => 
          s.email.toLowerCase().includes(filters.email.toLowerCase())
        );
      }
      
      if (filters.cpf) {
        filteredStudents = filteredStudents.filter(s => 
          s.cpf && s.cpf.includes(filters.cpf)
        );
      }
      
      if (filters.status) {
        filteredStudents = filteredStudents.filter(s => 
          s.status === filters.status
        );
      }
    }
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredStudents.length);
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    return of({
      data: paginatedStudents,
      page,
      pageSize,
      totalItems: filteredStudents.length,
      totalPages: Math.ceil(filteredStudents.length / pageSize)
    }).pipe(delay(300)); // Add delay to simulate network latency
  }
  
  getStudent(id: number): Observable<Student> {
    const student = this.students.find(s => s.id === id);
    
    if (!student) {
      return new Observable(observer => {
        observer.error({ message: 'Student not found' });
      });
    }
    
    return of(student).pipe(delay(300));
  }
  
  createStudent(student: Partial<Student>): Observable<Student> {
    const newId = Math.max(...this.students.map(s => s.id)) + 1;
    const now = new Date();
    
    const newStudent: Student = {
      id: newId,
      name: student.name || '',
      email: student.email || '',
      birthDate: student.birthDate || new Date(),
      cpf: student.cpf || '',
      mainPhone: student.mainPhone || '',
      address: student.address || '',
      photoUrl: student.photoUrl,
      additionalPhones: student.additionalPhones,
      socialMedia: student.socialMedia,
      medicalInfo: student.medicalInfo,
      accessibilityNeeds: student.accessibilityNeeds,
      observation: student.observation,
      status: student.status || 'active',
      registrationNumber: `${new Date().getFullYear()}${String(newId).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now
    };
    
    this.students.push(newStudent);
    
    return of(newStudent).pipe(delay(300));
  }
  
  updateStudent(id: number, student: Partial<Student>): Observable<Student> {
    const index = this.students.findIndex(s => s.id === id);
    
    if (index === -1) {
      return new Observable(observer => {
        observer.error({ message: 'Student not found' });
      });
    }
    
    const updatedStudent = {
      ...this.students[index],
      ...student,
      updatedAt: new Date()
    };
    
    this.students[index] = updatedStudent;
    
    return of(updatedStudent).pipe(delay(300));
  }
  
  deleteStudent(id: number): Observable<void> {
    const index = this.students.findIndex(s => s.id === id);
    
    if (index === -1) {
      return new Observable(observer => {
        observer.error({ message: 'Student not found' });
      });
    }
    
    this.students.splice(index, 1);
    
    return of(undefined).pipe(delay(300));
  }
  
  getGuardians(studentId: number): Observable<Guardian[]> {
    const studentGuardians = this.guardians.filter(g => g.studentId === studentId);
    return of(studentGuardians).pipe(delay(300));
  }
  
  addGuardian(studentId: number, guardian: Partial<Guardian>): Observable<Guardian> {
    const newId = Math.max(...this.guardians.map(g => g.id)) + 1;
    
    const newGuardian: Guardian = {
      id: newId,
      studentId,
      name: guardian.name || '',
      email: guardian.email,
      cpf: guardian.cpf,
      relationship: guardian.relationship || '',
      phones: guardian.phones || [],
      permissions: guardian.permissions || {
        pickupStudent: false,
        receiveNotifications: true,
        authorizeActivities: false
      }
    };
    
    this.guardians.push(newGuardian);
    
    return of(newGuardian).pipe(delay(300));
  }
  
  updateGuardian(guardianId: number, guardian: Partial<Guardian>): Observable<Guardian> {
    const index = this.guardians.findIndex(g => g.id === guardianId);
    
    if (index === -1) {
      return new Observable(observer => {
        observer.error({ message: 'Guardian not found' });
      });
    }
    
    const updatedGuardian = {
      ...this.guardians[index],
      ...guardian
    };
    
    this.guardians[index] = updatedGuardian;
    
    return of(updatedGuardian).pipe(delay(300));
  }
  
  deleteGuardian(guardianId: number): Observable<void> {
    const index = this.guardians.findIndex(g => g.id === guardianId);
    
    if (index === -1) {
      return new Observable(observer => {
        observer.error({ message: 'Guardian not found' });
      });
    }
    
    this.guardians.splice(index, 1);
    
    return of(undefined).pipe(delay(300));
  }
  
  getDocuments(studentId: number): Observable<any[]> {
    const studentDocs = this.documents.filter(d => d.studentId === studentId);
    return of(studentDocs).pipe(delay(300));
  }
  
  getNotes(studentId: number, includeConfidential: boolean = false): Observable<any[]> {
    let studentNotes = this.notes.filter(n => n.studentId === studentId);
    
    if (!includeConfidential) {
      studentNotes = studentNotes.filter(n => !n.isConfidential);
    }
    
    return of(studentNotes).pipe(delay(300));
  }
}
