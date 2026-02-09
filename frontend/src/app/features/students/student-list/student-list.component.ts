import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { StudentService } from '../../../core/services/student.service';
import { Student, STUDENT_STATUS_LABELS } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['registrationNumber', 'name', 'cpf', 'email', 'phone', 'status', 'actions'];
  dataSource: MatTableDataSource<Student>;
  loading = false;
  error: string | null = null;

  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  };

  statusLabels = STUDENT_STATUS_LABELS;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private studentService: StudentService) {
    this.dataSource = new MatTableDataSource<Student>([]);
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadStudents(): void {
    this.loading = true;
    this.error = null;

    this.studentService.getStudents(1, 100).subscribe({
      next: (response) => {
        const students = response.data || [];
        this.dataSource.data = students;
        this.calculateStats(students);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.error = 'Erro ao carregar alunos. Tente novamente.';
        this.loading = false;
      }
    });
  }

  calculateStats(students: Student[]) {
    this.stats = {
      total: students.length,
      active: students.filter(s => s.status === 'active').length,
      inactive: students.filter(s => s.status === 'inactive').length,
      suspended: students.filter(s => s.status === 'suspended').length
    };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      case 'suspended': return 'accent';
      default: return '';
    }
  }

  deleteStudent(student: Student): void {
    if (!student.id) return;

    if (confirm(`Tem certeza que deseja excluir o aluno ${student.user.name}?`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => this.loadStudents(),
        error: (err) => {
          console.error('Error deleting student:', err);
          alert('Erro ao excluir aluno. Tente novamente.');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  formatCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
