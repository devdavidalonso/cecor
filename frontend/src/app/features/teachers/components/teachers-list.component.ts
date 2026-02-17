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

import { ProfessorService, Professor } from '../../../core/services/professor.service';

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
        <h1 class="text-2xl font-bold">Gerenciar Professores</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Novo Professor
        </button>
      </div>

      <mat-card>
        <table mat-table [dataSource]="professors" class="w-full">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nome </th>
            <td mat-cell *matCellDef="let professor"> {{professor.name}} </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let professor"> {{professor.email}} </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Ações </th>
            <td mat-cell *matCellDef="let professor">
              <button mat-icon-button color="primary" (click)="openDialog(professor)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProfessor(professor)">
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
    <ng-template #professorDialog>
      <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Novo' }} Professor</h2>
      <mat-dialog-content>
        <form [formGroup]="professorForm" class="flex flex-col gap-4 min-w-[300px]">
          <mat-form-field appearance="outline">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="name" placeholder="Ex: João Silva">
            <mat-error *ngIf="professorForm.get('name')?.hasError('required')">
              Nome é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Ex: joao@cecor.org">
            <mat-error *ngIf="professorForm.get('email')?.hasError('required')">
              Email é obrigatório
            </mat-error>
            <mat-error *ngIf="professorForm.get('email')?.hasError('email')">
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
        <button mat-raised-button color="primary" [disabled]="professorForm.invalid" (click)="saveProfessor()">
          Salvar
        </button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class TeachersListComponent implements OnInit {
  professors: Professor[] = [];
  displayedColumns: string[] = ['name', 'email', 'actions'];
  professorForm: FormGroup;
  isEdit = false;
  currentId?: number;

  @ViewChild('professorDialog') professorDialogTemplate: any;
  dialogRef: any;

  constructor(
    private professorService: ProfessorService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.professorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: [''],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfessors();
  }

  loadProfessors(): void {
    this.professorService.getProfessors().subscribe(
      (data) => this.professors = data,
      (error) => console.error('Error loading professors', error)
    );
  }

  openDialog(professor?: Professor): void {
    this.isEdit = !!professor;
    this.currentId = professor?.id;

    if (professor) {
      this.professorForm.patchValue(professor);
      // Disable email on edit if desired, or keep editable
      this.professorForm.get('email')?.disable();
    } else {
      this.professorForm.reset();
      this.professorForm.get('email')?.enable();
    }

    this.dialogRef = this.dialog.open(this.professorDialogTemplate);
  }

  saveProfessor(): void {
    if (this.professorForm.invalid) return;

    const professorData = this.professorForm.getRawValue();

    if (this.isEdit && this.currentId) {
      this.professorService.updateProfessor(this.currentId, professorData).subscribe(
        () => {
          this.snackBar.open('Professor atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProfessors();
          this.dialogRef.close();
        },
        error => this.snackBar.open('Erro ao atualizar professor', 'Fechar', { duration: 3000 })
      );
    } else {
      this.professorService.createProfessor(professorData).subscribe(
        () => {
          this.snackBar.open('Professor criado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProfessors();
          this.dialogRef.close();
        },
        error => this.snackBar.open('Erro ao criar professor', 'Fechar', { duration: 3000 })
      );
    }
  }

  deleteProfessor(professor: Professor): void {
    if (confirm(`Tem certeza que deseja excluir ${professor.name}?`)) {
      this.professorService.deleteProfessor(professor.id!).subscribe(
        () => {
          this.snackBar.open('Professor excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProfessors();
        },
        error => this.snackBar.open('Erro ao excluir professor', 'Fechar', { duration: 3000 })
      );
    }
  }
}
