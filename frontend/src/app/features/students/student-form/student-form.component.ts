import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StudentService } from '../../../core/services/student.service';
import { CreateStudentRequest } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  personalDataForm!: FormGroup;
  studentDataForm!: FormGroup;
  guardiansForm!: FormGroup;
  
  isSubmitting = false;
  isEditMode = false;
  studentId: number | null = null;

  relationshipOptions = [
    { value: 'father', label: 'Pai' },
    { value: 'mother', label: 'Mãe' },
    { value: 'grandfather', label: 'Avô' },
    { value: 'grandmother', label: 'Avó' },
    { value: 'uncle', label: 'Tio' },
    { value: 'aunt', label: 'Tia' },
    { value: 'brother', label: 'Irmão' },
    { value: 'sister', label: 'Irmã' },
    { value: 'other', label: 'Outro' }
  ];

  statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'suspended', label: 'Suspenso' }
  ];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.studentId = +id;
      // TODO: Load student data for editing
    }
  }

  initForms(): void {
    // Step 1: Personal Data
    this.personalDataForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      address: ['', Validators.required]
    });

    // Step 2: Student Data
    this.studentDataForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      status: ['active', Validators.required],
      emergencyContact: ['', Validators.required],
      additionalPhone1: [''],
      additionalPhone2: [''],
      medicalInfo: [''],
      specialNeeds: [''],
      notes: ['']
    });

    // Step 3: Guardians (FormArray)
    this.guardiansForm = this.fb.group({
      guardians: this.fb.array([])
    });
  }

  get guardians(): FormArray {
    return this.guardiansForm.get('guardians') as FormArray;
  }

  addGuardian(): void {
    const guardianGroup = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      email: ['', Validators.email],
      address: [''],
      permissions: this.fb.group({
        canPickup: [true],
        canAuthorizeLeave: [false],
        receivesNotifications: [true],
        portalAccess: [false]
      })
    });
    this.guardians.push(guardianGroup);
  }

  removeGuardian(index: number): void {
    if (confirm('Tem certeza que deseja remover este responsável?')) {
      this.guardians.removeAt(index);
    }
  }

  copyStudentAddress(guardianIndex: number): void {
    const studentAddress = this.personalDataForm.get('address')?.value;
    if (studentAddress) {
      this.guardians.at(guardianIndex).get('address')?.setValue(studentAddress);
      this.snackBar.open('Endereço copiado!', 'Fechar', { duration: 2000 });
    }
  }

  // Mask formatters
  formatCPF(event: any, controlName: string, formGroup: any = null): void {
    const form = (formGroup as FormGroup) || this.personalDataForm;
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    form.get(controlName)?.setValue(value, { emitEvent: false });
  }

  formatPhone(event: any, controlName: string, formGroup: any = null): void {
    const form = (formGroup as FormGroup) || this.personalDataForm;
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length >= 11) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    } else if (value.length >= 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length >= 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    
    form.get(controlName)?.setValue(value, { emitEvent: false });
  }

  displayCPF(cpf: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  }

  submit(): void {
    if (this.personalDataForm.valid && this.studentDataForm.valid) {
      this.isSubmitting = true;

      const studentData: CreateStudentRequest = {
        user: {
          name: this.personalDataForm.value.name,
          email: this.personalDataForm.value.email,
          cpf: this.personalDataForm.value.cpf,
          birthDate: this.personalDataForm.value.birthDate,
          phone: this.personalDataForm.value.phone,
          address: this.personalDataForm.value.address,
          profile: 'student',
          active: true,
          password: 'temp123' // Temporary password, will be changed by Keycloak
        },
        registrationNumber: this.studentDataForm.value.registrationNumber,
        status: this.studentDataForm.value.status,
        emergencyContact: this.studentDataForm.value.emergencyContact,
        additionalPhone1: this.studentDataForm.value.additionalPhone1,
        additionalPhone2: this.studentDataForm.value.additionalPhone2,
        medicalInfo: this.studentDataForm.value.medicalInfo,
        specialNeeds: this.studentDataForm.value.specialNeeds,
        notes: this.studentDataForm.value.notes
      };

      this.studentService.createStudent(studentData).subscribe({
        next: () => {
          this.snackBar.open('Aluno cadastrado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (err) => {
          console.error('Error creating student:', err);
          this.snackBar.open('Erro ao cadastrar aluno. Verifique os dados e tente novamente.', 'Fechar', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
    }
  }
}
