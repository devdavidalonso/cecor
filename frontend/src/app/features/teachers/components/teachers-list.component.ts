import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TeacherService, Teacher } from '../../../core/services/teacher.service';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Gerenciar Teacheres</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Novo Teacher
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

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Ações </th>
            <td mat-cell *matCellDef="let teacher">
              <button mat-icon-button color="primary" (click)="openDialog(teacher)">
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

    <!-- Dialog Template (inline for simplicity) -->
    <ng-template #teacherDialog>
      <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Novo' }} Teacher</h2>
      <mat-dialog-content>
        <form [formGroup]="teacherForm" class="flex flex-col gap-4 min-w-[300px]">
          <mat-form-field appearance="outline">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="name" placeholder="Ex: João Silva">
            <mat-error *ngIf="teacherForm.get('name')?.hasError('required')">
              Nome é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Ex: joao@cecor.org">
            <mat-error *ngIf="teacherForm.get('email')?.hasError('required')">
              Email é obrigatório
            </mat-error>
            <mat-error *ngIf="teacherForm.get('email')?.hasError('email')">
              Email inválido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CPF</mat-label>
            <input matInput formControlName="cpf" placeholder="000.000.000-00">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="phone" placeholder="(00) 00000-0000">
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="teacherForm.invalid" (click)="saveTeacher()">
          Salvar
        </button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class TeachersListComponent implements OnInit {
  teachers: Teacher[] = [];
  displayedColumns: string[] = ['name', 'email', 'actions'];
  teacherForm: FormGroup;
  isEdit = false;
  currentId?: number;

  @ViewChild('teacherDialog') teacherDialogTemplate: any;
  dialogRef: any;

  constructor(
    private teacherService: TeacherService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.teacherForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: [''],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.teacherService.getTeachers().subscribe(
      (data) => this.teachers = data,
      (error) => console.error('Error loading teachers', error)
    );
  }

  openDialog(teacher?: Teacher): void {
    this.isEdit = !!teacher;
    this.currentId = teacher?.id;

    if (teacher) {
      this.teacherForm.patchValue(teacher);
      // Disable email on edit if desired, or keep editable
      this.teacherForm.get('email')?.disable();
    } else {
      this.teacherForm.reset();
      this.teacherForm.get('email')?.enable();
    }

    this.dialogRef = this.dialog.open(this.teacherDialogTemplate);
  }

  saveTeacher(): void {
    if (this.teacherForm.invalid) return;

    const teacherData = this.teacherForm.getRawValue();

    if (this.isEdit && this.currentId) {
      this.teacherService.updateTeacher(this.currentId, teacherData).subscribe(
        () => {
          this.snackBar.open('Teacher atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTeachers();
          this.dialogRef.close();
        },
        error => this.snackBar.open('Erro ao atualizar teacher', 'Fechar', { duration: 3000 })
      );
    } else {
      this.teacherService.createTeacher(teacherData).subscribe(
        () => {
          this.snackBar.open('Teacher criado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTeachers();
          this.dialogRef.close();
        },
        error => this.snackBar.open('Erro ao criar teacher', 'Fechar', { duration: 3000 })
      );
    }
  }

  deleteTeacher(teacher: Teacher): void {
    if (confirm(`Tem certeza que deseja excluir ${teacher.name}?`)) {
      this.teacherService.deleteTeacher(teacher.id!).subscribe(
        () => {
          this.snackBar.open('Teacher excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTeachers();
        },
        error => this.snackBar.open('Erro ao excluir teacher', 'Fechar', { duration: 3000 })
      );
    }
  }
}
