import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

import { TeacherService, Teacher } from '../../../core/services/teacher.service';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Gerenciar Professores</h2>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> Novo Professor
        </button>
      </div>

      <mat-card>
        <table mat-table [dataSource]="teachers" class="w-full">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nome </th>
            <td mat-cell *matCellDef="let teacher"> {{teacher.name}} </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let teacher"> {{teacher.email}} </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let teacher">
              <span class="px-2 py-1 rounded text-sm" [ngClass]="{'bg-green-100 text-green-800': teacher.active, 'bg-red-100 text-red-800': !teacher.active}">
                {{ teacher.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Ações </th>
            <td mat-cell *matCellDef="let teacher">
              <button mat-icon-button color="primary" [routerLink]="[teacher.id]">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteTeacher(teacher)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `
})
export class TeachersListComponent implements OnInit {
  teachers: Teacher[] = [];
  displayedColumns: string[] = ['name', 'email', 'status', 'actions'];

  constructor(
    private teacherService: TeacherService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.teacherService.getTeachers().subscribe(
      (data) => this.teachers = data,
      (error) => console.error('Error loading teachers', error)
    );
  }

  deleteTeacher(teacher: Teacher): void {
    if (confirm(`Tem certeza que deseja remover o professor ${teacher.name}?`)) {
      this.teacherService.deleteTeacher(teacher.id!).subscribe({
        next: () => {
          this.snackBar.open('Professor removido com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTeachers();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erro ao remover. Pode haver relacionamentos (ex: turmas).', 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
