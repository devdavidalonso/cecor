// src/app/features/interviews/components/form-builder.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { InterviewService } from '../../../core/services/interview.service';
import { FormDefinition, Question, QuestionType, generateQuestionId, QUESTION_TEMPLATES } from '../../../core/models/interview.model';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatExpansionModule,
    DragDropModule
  ],
  template: `
    <div class="form-builder-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assignment</mat-icon>
            {{ isEditMode ? 'Editar Formulário' : 'Novo Formulário de Entrevista' }}
          </mat-card-title>
          <mat-card-subtitle>
            Crie questionários dinâmicos para avaliação socioeducacional
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Form Header -->
          <form [formGroup]="formGroup" class="header-form">
            <div class="row">
              <mat-form-field appearance="outline" class="flex-2">
                <mat-label>Título do Formulário</mat-label>
                <input matInput formControlName="title" placeholder="Ex: Perfil Socioeducacional 2026">
                <mat-error *ngIf="formGroup.get('title')?.hasError('required')">
                  Título é obrigatório
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Versão</mat-label>
                <input matInput formControlName="version" placeholder="Ex: v1_2026">
                <mat-hint>Formato recomendado: v1_2026</mat-hint>
                <mat-error *ngIf="formGroup.get('version')?.hasError('required')">
                  Versão é obrigatória
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descrição</mat-label>
              <textarea matInput formControlName="description" rows="2" 
                placeholder="Descreva o objetivo deste formulário..."></textarea>
            </mat-form-field>

            <div class="active-toggle">
              <mat-slide-toggle formControlName="isActive" color="primary">
                Formulário Ativo
              </mat-slide-toggle>
              <span class="hint">Apenas formulários ativos são exibidos para os alunos</span>
            </div>
          </form>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Questions Section -->
          <div class="questions-section">
            <div class="section-header">
              <h3>
                <mat-icon>quiz</mat-icon>
                Perguntas ({{ questions.length }})
              </h3>
              
              <div class="actions">
                <button mat-stroked-button color="accent" (click)="showTemplates = !showTemplates">
                  <mat-icon>{{ showTemplates ? 'expand_less' : 'expand_more' }}</mat-icon>
                  Perguntas Prontas
                </button>
                <button mat-raised-button color="primary" (click)="addQuestion()">
                  <mat-icon>add</mat-icon>
                  Nova Pergunta
                </button>
              </div>
            </div>

            <!-- Templates Panel -->
            <div class="templates-panel" *ngIf="showTemplates">
              <mat-card class="templates-card">
                <mat-card-subtitle>Clique para adicionar uma pergunta pré-definida</mat-card-subtitle>
                <div class="templates-list">
                  <button mat-stroked-button *ngFor="let template of questionTemplates" 
                          (click)="addQuestionFromTemplate(template)"
                          class="template-btn">
                    {{ template.label }}
                  </button>
                </div>
              </mat-card>
            </div>

            <!-- Questions List -->
            <div class="questions-list" cdkDropList (cdkDropListDropped)="dropQuestion($event)">
              <mat-expansion-panel *ngFor="let question of questions.controls; let i = index" 
                                   [formGroup]="getQuestionForm(i)"
                                   cdkDrag
                                   class="question-panel"
                                   [expanded]="expandedQuestion === i">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                    <span class="question-number">{{ i + 1 }}.</span>
                    <span class="question-label">{{ question.get('label')?.value || 'Nova Pergunta' }}</span>
                    <span class="question-type">({{ getTypeLabel(question.get('type')?.value) }})</span>
                    <mat-icon *ngIf="question.get('required')?.value" class="required-icon" color="warn">
                      priority_high
                    </mat-icon>
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="question-content">
                  <div class="row">
                    <mat-form-field appearance="outline" class="flex-2">
                      <mat-label>Texto da Pergunta</mat-label>
                      <input matInput formControlName="label" placeholder="Digite a pergunta">
                      <mat-error *ngIf="question.get('label')?.hasError('required')">
                        Texto é obrigatório
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Tipo de Resposta</mat-label>
                      <mat-select formControlName="type" (selectionChange)="onTypeChange(i)">
                        <mat-option value="text">Texto Livre</mat-option>
                        <mat-option value="select">Seleção Única</mat-option>
                        <mat-option value="boolean">Sim/Não</mat-option>
                        <mat-option value="multiple_choice">Múltipla Escolha</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <!-- Options for select/multiple_choice -->
                  <div class="options-section" *ngIf="hasOptions(i)">
                    <div class="options-header">
                      <span>Opções de Resposta:</span>
                      <button mat-icon-button color="primary" (click)="addOption(i)" matTooltip="Adicionar opção">
                        <mat-icon>add_circle</mat-icon>
                      </button>
                    </div>
                    <div class="options-list" formArrayName="options">
                      <div *ngFor="let option of getOptions(i).controls; let j = index" class="option-row">
                        <mat-form-field appearance="outline" class="option-field">
                          <input matInput [formControlName]="j" placeholder="Opção {{ j + 1 }}">
                        </mat-form-field>
                        <button mat-icon-button color="warn" (click)="removeOption(i, j)" 
                                matTooltip="Remover opção">
                          <mat-icon>remove_circle</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Placeholder for text -->
                  <mat-form-field appearance="outline" class="full-width" *ngIf="question.get('type')?.value === 'text'">
                    <mat-label>Texto de Ajuda (Placeholder)</mat-label>
                    <input matInput formControlName="placeholder" placeholder="Ex: Digite sua resposta aqui...">
                  </mat-form-field>

                  <div class="question-footer">
                    <mat-checkbox formControlName="required" color="primary">
                      Pergunta Obrigatória
                    </mat-checkbox>
                    
                    <div class="question-actions">
                      <button mat-icon-button (click)="moveQuestion(i, -1)" 
                              [disabled]="i === 0" matTooltip="Mover para cima">
                        <mat-icon>arrow_upward</mat-icon>
                      </button>
                      <button mat-icon-button (click)="moveQuestion(i, 1)" 
                              [disabled]="i === questions.length - 1" matTooltip="Mover para baixo">
                        <mat-icon>arrow_downward</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="removeQuestion(i)" 
                              matTooltip="Remover pergunta">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="questions.length === 0">
              <mat-icon>quiz</mat-icon>
              <p>Nenhuma pergunta adicionada ainda.</p>
              <p class="hint">Clique em "Nova Pergunta" ou selecione uma das perguntas prontas acima.</p>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button (click)="cancel()">Cancelar</button>
          <button mat-stroked-button color="accent" (click)="preview()" [disabled]="questions.length === 0">
            <mat-icon>preview</mat-icon>
            Visualizar
          </button>
          <button mat-raised-button color="primary" 
                  (click)="save()" 
                  [disabled]="formGroup.invalid || questions.length === 0 || isSaving">
            <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
            {{ isSaving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Formulário') }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-builder-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      
      mat-icon {
        color: #006aac;
      }
    }

    .header-form {
      margin-top: 16px;
    }

    .row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .flex-1 {
      flex: 1;
    }

    .flex-2 {
      flex: 2;
    }

    .full-width {
      width: 100%;
    }

    .active-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 16px 0;

      .hint {
        color: #666;
        font-size: 12px;
      }
    }

    .section-divider {
      margin: 24px 0;
    }

    .questions-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #333;

          mat-icon {
            color: #006aac;
          }
        }

        .actions {
          display: flex;
          gap: 12px;
        }
      }
    }

    .templates-panel {
      margin-bottom: 16px;

      .templates-card {
        background-color: #f5f5f5;
      }

      .templates-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;

        .template-btn {
          font-size: 12px;
        }
      }
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .question-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px;

      .drag-handle {
        cursor: move;
        margin-right: 8px;
        color: #999;
      }

      .question-number {
        font-weight: bold;
        margin-right: 8px;
        color: #006aac;
      }

      .question-label {
        flex: 1;
      }

      .question-type {
        color: #666;
        font-size: 12px;
        margin-left: 8px;
      }

      .required-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }

    .question-content {
      padding: 16px 0;
    }

    .options-section {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;

      .options-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
      }

      .options-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .option-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .option-field {
        flex: 1;
      }
    }

    .question-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;

      .question-actions {
        display: flex;
        gap: 4px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 16px;
      }

      p {
        margin: 0;
      }

      .hint {
        font-size: 14px;
        color: #999;
        margin-top: 8px;
      }
    }

    mat-card-actions {
      padding: 16px 24px;
      gap: 12px;
    }
  `]
})
export class FormBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  formGroup!: FormGroup;
  questions!: FormArray;
  
  isEditMode = false;
  formId: string | null = null;
  isSaving = false;
  showTemplates = false;
  expandedQuestion: number | null = 0;
  questionTemplates = QUESTION_TEMPLATES;

  ngOnInit(): void {
    this.initForm();
    
    // Check if editing existing form
    this.formId = this.route.snapshot.paramMap.get('id');
    if (this.formId) {
      this.isEditMode = true;
      this.loadForm(this.formId);
    }
  }

  private initForm(): void {
    this.questions = this.fb.array([]);
    
    this.formGroup = this.fb.group({
      title: ['', [Validators.required]],
      version: ['', [Validators.required]],
      description: [''],
      isActive: [true],
      questions: this.questions
    });
  }

  private loadForm(id: string): void {
    this.interviewService.getForm(id).subscribe(form => {
      if (form) {
        this.formGroup.patchValue({
          title: form.title,
          version: form.version,
          description: form.description,
          isActive: form.isActive
        });

        // Load questions
        form.questions.forEach(q => {
          this.questions.push(this.createQuestionForm(q));
        });
      } else {
        this.snackBar.open('Formulário não encontrado', 'Fechar', { duration: 3000 });
        this.router.navigate(['/interviews']);
      }
    });
  }

  private createQuestionForm(question?: Question): FormGroup {
    const options = question?.options || [];
    
    return this.fb.group({
      id: [question?.id || generateQuestionId()],
      label: [question?.label || '', [Validators.required]],
      type: [question?.type || 'text', [Validators.required]],
      options: this.fb.array(options.map(o => this.fb.control(o))),
      required: [question?.required ?? true],
      placeholder: [question?.placeholder || '']
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionForm());
    this.expandedQuestion = this.questions.length - 1;
  }

  addQuestionFromTemplate(template: Partial<Question>): void {
    const question: Question = {
      id: generateQuestionId(),
      label: template.label || '',
      type: template.type || 'text',
      options: template.options || [],
      required: template.required ?? false,
      placeholder: template.placeholder || ''
    };
    
    this.questions.push(this.createQuestionForm(question));
    this.expandedQuestion = this.questions.length - 1;
    this.showTemplates = false;
  }

  removeQuestion(index: number): void {
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
      this.questions.removeAt(index);
    }
  }

  getQuestionForm(index: number): FormGroup {
    return this.questions.at(index) as FormGroup;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  hasOptions(questionIndex: number): boolean {
    const type = this.questions.at(questionIndex).get('type')?.value;
    return type === 'select' || type === 'multiple_choice';
  }

  onTypeChange(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const type = question.get('type')?.value;
    const optionsArray = question.get('options') as FormArray;

    // Clear options if type doesn't support them
    if (type !== 'select' && type !== 'multiple_choice') {
      while (optionsArray.length) {
        optionsArray.removeAt(0);
      }
    } else if (optionsArray.length === 0) {
      // Add default empty options
      optionsArray.push(this.fb.control(''));
      optionsArray.push(this.fb.control(''));
    }
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.push(this.fb.control(''));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    if (options.length > 1) {
      options.removeAt(optionIndex);
    }
  }

  moveQuestion(index: number, direction: number): void {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.questions.length) {
      const question = this.questions.at(index);
      this.questions.removeAt(index);
      this.questions.insert(newIndex, question);
    }
  }

  dropQuestion(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.questions.controls, event.previousIndex, event.currentIndex);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      text: 'Texto Livre',
      select: 'Seleção Única',
      boolean: 'Sim/Não',
      multiple_choice: 'Múltipla Escolha'
    };
    return labels[type] || type;
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    if (this.questions.length === 0) {
      this.snackBar.open('Adicione pelo menos uma pergunta', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;

    const formData: FormDefinition = {
      ...this.formGroup.value,
      questions: this.questions.value.map((q: Question) => ({
        ...q,
        // Clean up options for non-option types
        options: (q.type === 'select' || q.type === 'multiple_choice') 
          ? q.options?.filter((o: string) => o.trim() !== '')
          : undefined
      }))
    };

    if (this.isEditMode && this.formId) {
      this.interviewService.updateForm(this.formId, formData).subscribe(success => {
        this.isSaving = false;
        if (success) {
          this.snackBar.open('Formulário atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/interviews']);
        } else {
          this.snackBar.open('Erro ao atualizar formulário', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.interviewService.createForm(formData).subscribe(form => {
        this.isSaving = false;
        if (form) {
          this.snackBar.open('Formulário criado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/interviews']);
        } else {
          this.snackBar.open('Erro ao criar formulário', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  preview(): void {
    // TODO: Implement preview dialog
    this.snackBar.open('Visualização em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  cancel(): void {
    this.router.navigate(['/interviews']);
  }
}
