// src/app/features/alunos/components/aluno-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AlunoService } from '../../../core/services/aluno.service';
import { CEPService } from '../../../core/services/cep.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatTabsModule,
    MatStepperModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Editar Aluno' : 'Cadastrar Novo Aluno' }}</mat-card-title>
          <mat-card-subtitle>Preencha os dados do aluno</mat-card-subtitle>
        </mat-card-header>

        <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>

        <mat-card-content>
          <form [formGroup]="alunoForm" (ngSubmit)="onSubmit()">
            <mat-stepper [linear]="true" #stepper>
              <!-- Etapa 1: Dados Pessoais -->
              <mat-step [stepControl]="dadosPessoaisForm" label="Dados Pessoais">
                <form [formGroup]="dadosPessoaisForm">
                  <div class="step-content">
                    <h3>Informações Básicas</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Nome Completo</mat-label>
                        <input matInput formControlName="nome" placeholder="Nome completo do aluno">
                        <mat-error *ngIf="dadosPessoaisForm.get('nome')?.hasError('required')">
                          Nome é obrigatório
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Data de Nascimento</mat-label>
                        <input matInput [matDatepicker]="picker" formControlName="dataNascimento">
                        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                        <mat-error *ngIf="dadosPessoaisForm.get('dataNascimento')?.hasError('required')">
                          Data de nascimento é obrigatória
                        </mat-error>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Idade</mat-label>
                        <input matInput formControlName="idade" readonly>
                        <mat-hint>Calculada automaticamente</mat-hint>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>CPF</mat-label>
                        <input matInput formControlName="cpf" placeholder="000.000.000-00">
                        <mat-error *ngIf="dadosPessoaisForm.get('cpf')?.hasError('required')">
                          CPF é obrigatório
                        </mat-error>
                        <mat-error *ngIf="dadosPessoaisForm.get('cpf')?.hasError('pattern')">
                          CPF inválido
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <h3>Contato</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>E-mail</mat-label>
                        <input matInput formControlName="email" placeholder="email@exemplo.com" type="email">
                        <mat-error *ngIf="dadosPessoaisForm.get('email')?.hasError('required')">
                          E-mail é obrigatório
                        </mat-error>
                        <mat-error *ngIf="dadosPessoaisForm.get('email')?.hasError('email')">
                          E-mail inválido
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Telefone Principal</mat-label>
                        <input matInput formControlName="telefonePrincipal" placeholder="(00) 00000-0000">
                        <mat-error *ngIf="dadosPessoaisForm.get('telefonePrincipal')?.hasError('required')">
                          Telefone principal é obrigatório
                        </mat-error>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Telefone Adicional</mat-label>
                        <input matInput formControlName="telefoneAdicional" placeholder="(00) 00000-0000">
                      </mat-form-field>
                    </div>
                    
                    <h3>Endereço</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field form-field-small">
                        <mat-label>CEP</mat-label>
                        <input matInput formControlName="cep" placeholder="00000-000">
                        <mat-error *ngIf="dadosPessoaisForm.get('cep')?.hasError('required')">
                          CEP é obrigatório
                        </mat-error>
                      </mat-form-field>
                      
                      <button mat-stroked-button type="button" (click)="buscarCep()" 
                              [disabled]="!dadosPessoaisForm.get('cep')?.value || isCepLoading">
                        <mat-icon>search</mat-icon> 
                        {{ isCepLoading ? 'Buscando...' : 'Buscar Endereço' }}
                      </button>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field form-field-large">
                        <mat-label>Logradouro</mat-label>
                        <input matInput formControlName="logradouro">
                        <mat-error *ngIf="dadosPessoaisForm.get('logradouro')?.hasError('required')">
                          Logradouro é obrigatório
                        </mat-error>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="form-field form-field-small">
                        <mat-label>Número</mat-label>
                        <input matInput formControlName="numero" id="numero">
                        <mat-error *ngIf="dadosPessoaisForm.get('numero')?.hasError('required')">
                          Número é obrigatório
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Complemento</mat-label>
                        <input matInput formControlName="complemento">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Bairro</mat-label>
                        <input matInput formControlName="bairro">
                        <mat-error *ngIf="dadosPessoaisForm.get('bairro')?.hasError('required')">
                          Bairro é obrigatório
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Cidade</mat-label>
                        <input matInput formControlName="cidade">
                        <mat-error *ngIf="dadosPessoaisForm.get('cidade')?.hasError('required')">
                          Cidade é obrigatória
                        </mat-error>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="form-field form-field-small">
                        <mat-label>Estado</mat-label>
                        <mat-select formControlName="estado">
                          <mat-option value="AC">AC</mat-option>
                          <mat-option value="AL">AL</mat-option>
                          <mat-option value="AP">AP</mat-option>
                          <mat-option value="AM">AM</mat-option>
                          <mat-option value="BA">BA</mat-option>
                          <mat-option value="CE">CE</mat-option>
                          <mat-option value="DF">DF</mat-option>
                          <mat-option value="ES">ES</mat-option>
                          <mat-option value="GO">GO</mat-option>
                          <mat-option value="MA">MA</mat-option>
                          <mat-option value="MT">MT</mat-option>
                          <mat-option value="MS">MS</mat-option>
                          <mat-option value="MG">MG</mat-option>
                          <mat-option value="PA">PA</mat-option>
                          <mat-option value="PB">PB</mat-option>
                          <mat-option value="PR">PR</mat-option>
                          <mat-option value="PE">PE</mat-option>
                          <mat-option value="PI">PI</mat-option>
                          <mat-option value="RJ">RJ</mat-option>
                          <mat-option value="RN">RN</mat-option>
                          <mat-option value="RS">RS</mat-option>
                          <mat-option value="RO">RO</mat-option>
                          <mat-option value="RR">RR</mat-option>
                          <mat-option value="SC">SC</mat-option>
                          <mat-option value="SP">SP</mat-option>
                          <mat-option value="SE">SE</mat-option>
                          <mat-option value="TO">TO</mat-option>
                        </mat-select>
                        <mat-error *ngIf="dadosPessoaisForm.get('estado')?.hasError('required')">
                          Estado é obrigatório
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <h3>Informações Adicionais</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field full-width">
                        <mat-label>Informações Médicas</mat-label>
                        <textarea matInput formControlName="informacoesMedicas" rows="3" 
                                  placeholder="Alergias, medicamentos, etc."></textarea>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field full-width">
                        <mat-label>Necessidades Especiais</mat-label>
                        <textarea matInput formControlName="necessidadesEspeciais" rows="3"></textarea>
                      </mat-form-field>
                    </div>
                    
                    <div class="button-container">
                      <button mat-button matStepperNext type="button" color="primary">Próximo</button>
                    </div>
                  </div>
                </form>
              </mat-step>
              
              <!-- Etapa 2: Responsáveis -->
              <mat-step [stepControl]="responsaveisForm" label="Responsáveis">
                <form [formGroup]="responsaveisForm">
                  <div class="step-content">
                    <h3>Responsáveis</h3>
                    <p class="hint-text">Adicione até 3 responsáveis pelo aluno</p>
                    
                    <div formArrayName="responsaveis">
                      <div *ngFor="let responsavel of responsaveis.controls; let i = index" 
                           [formGroupName]="i" class="responsavel-container">
                        <div class="responsavel-header">
                          <h4>Responsável {{ i + 1 }}</h4>
                          <button *ngIf="i > 0" mat-icon-button color="warn" type="button" 
                                  (click)="removerResponsavel(i)" aria-label="Remover responsável">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                        
                        <div class="form-row">
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>Nome Completo</mat-label>
                            <input matInput formControlName="nome">
                            <mat-error *ngIf="responsavel.get('nome')?.hasError('required')">
                              Nome é obrigatório
                            </mat-error>
                          </mat-form-field>
                        </div>
                        
                        <div class="form-row">
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>CPF</mat-label>
                            <input matInput formControlName="cpf" placeholder="000.000.000-00">
                          </mat-form-field>
                          
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>Grau de Parentesco</mat-label>
                            <mat-select formControlName="grauParentesco">
                              <mat-option value="Pai">Pai</mat-option>
                              <mat-option value="Mãe">Mãe</mat-option>
                              <mat-option value="Avô/Avó">Avô/Avó</mat-option>
                              <mat-option value="Tio/Tia">Tio/Tia</mat-option>
                              <mat-option value="Irmão/Irmã">Irmão/Irmã</mat-option>
                              <mat-option value="Outro">Outro</mat-option>
                            </mat-select>
                            <mat-error *ngIf="responsavel.get('grauParentesco')?.hasError('required')">
                              Grau de parentesco é obrigatório
                            </mat-error>
                          </mat-form-field>
                        </div>
                        
                        <div class="form-row">
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>E-mail</mat-label>
                            <input matInput formControlName="email" type="email">
                            <mat-error *ngIf="responsavel.get('email')?.hasError('email')">
                              E-mail inválido
                            </mat-error>
                          </mat-form-field>
                          
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>Telefone</mat-label>
                            <input matInput formControlName="telefone" placeholder="(00) 00000-0000">
                            <mat-error *ngIf="responsavel.get('telefone')?.hasError('required')">
                              Telefone é obrigatório
                            </mat-error>
                          </mat-form-field>
                        </div>
                        
                        <h5>Permissões</h5>
                        <div class="form-row permissions-row">
                          <mat-checkbox formControlName="permissaoRetirarAluno">
                            Pode retirar o aluno
                          </mat-checkbox>
                          
                          <mat-checkbox formControlName="permissaoReceberNotificacoes">
                            Receber notificações
                          </mat-checkbox>
                          
                          <mat-checkbox formControlName="permissaoAutorizarAtividades">
                            Autorizar atividades
                          </mat-checkbox>
                        </div>
                        
                        <mat-divider *ngIf="i < responsaveis.length - 1" class="responsavel-divider"></mat-divider>
                      </div>
                    </div>
                    
                    <div class="add-responsavel" *ngIf="responsaveis.length < 3">
                      <button mat-stroked-button type="button" (click)="adicionarResponsavel()" color="primary">
                        <mat-icon>add</mat-icon> Adicionar Responsável
                      </button>
                    </div>
                    
                    <div class="button-container">
                      <button mat-button matStepperPrevious type="button">Voltar</button>
                      <button mat-button matStepperNext type="button" color="primary">Próximo</button>
                    </div>
                  </div>
                </form>
              </mat-step>
              
              <!-- Etapa 3: Documentos -->
              <mat-step label="Documentos e Observações">
                <div class="step-content">
                  <h3>Upload de Documentos</h3>
                  <p class="hint-text">Faça upload dos documentos digitalizados</p>
                  
                  <div class="documento-upload" formGroupName="documentos">
                    <div class="documento-tipo">
                      <span>Documento de Identidade</span>
                      <div class="upload-controls">
                        <input type="file" #documentoIdentidade hidden (change)="onFileSelected($event, 'documentoIdentidade')">
                        <button mat-stroked-button type="button" (click)="documentoIdentidade.click()">
                          <mat-icon>upload</mat-icon> Upload
                        </button>
                        <span *ngIf="alunoForm.get('documentos.documentoIdentidade')?.value" class="file-selected">
                          <mat-icon color="primary">check_circle</mat-icon> Arquivo selecionado
                        </span>
                      </div>
                    </div>
                    
                    <div class="documento-tipo">
                      <span>Comprovante de Residência</span>
                      <div class="upload-controls">
                        <input type="file" #comprovanteResidencia hidden (change)="onFileSelected($event, 'comprovanteResidencia')">
                        <button mat-stroked-button type="button" (click)="comprovanteResidencia.click()">
                          <mat-icon>upload</mat-icon> Upload
                        </button>
                        <span *ngIf="alunoForm.get('documentos.comprovanteResidencia')?.value" class="file-selected">
                          <mat-icon color="primary">check_circle</mat-icon> Arquivo selecionado
                        </span>
                      </div>
                    </div>
                    
                    <div class="documento-tipo">
                      <span>Foto do Aluno</span>
                      <div class="upload-controls">
                        <input type="file" #fotoAluno hidden accept="image/*" (change)="onFileSelected($event, 'fotoAluno')">
                        <button mat-stroked-button type="button" (click)="fotoAluno.click()">
                          <mat-icon>upload</mat-icon> Upload
                        </button>
                        <span *ngIf="alunoForm.get('documentos.fotoAluno')?.value" class="file-selected">
                          <mat-icon color="primary">check_circle</mat-icon> Arquivo selecionado
                        </span>
                      </div>
                    </div>
                    
                    <div class="documento-tipo">
                      <span>Documento Adicional</span>
                      <div class="upload-controls">
                        <input type="file" #documentoAdicional hidden (change)="onFileSelected($event, 'documentoAdicional')">
                        <button mat-stroked-button type="button" (click)="documentoAdicional.click()">
                          <mat-icon>upload</mat-icon> Upload
                        </button>
                        <span *ngIf="alunoForm.get('documentos.documentoAdicional')?.value" class="file-selected">
                          <mat-icon color="primary">check_circle</mat-icon> Arquivo selecionado
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h3>Observações</h3>
                  
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field full-width">
                      <mat-label>Observações</mat-label>
                      <textarea matInput formControlName="observacoes" rows="4"></textarea>
                      <mat-hint>Informações adicionais sobre o aluno</mat-hint>
                    </mat-form-field>
                  </div>
                  
                  <div class="form-row">
                    <mat-checkbox formControlName="observacaoConfidencial">
                      Observação confidencial (visível apenas para administradores)
                    </mat-checkbox>
                  </div>
                  
                  <div class="button-container">
                    <button mat-button matStepperPrevious type="button">Voltar</button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting">
                      <span *ngIf="!isSubmitting">Salvar</span>
                      <span *ngIf="isSubmitting">Salvando...</span>
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 900px;
      margin: 20px auto;
      padding: 0 16px;
    }
    
    .step-content {
      margin-top: 20px;
      min-height: 300px;
    }
    
    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .form-field {
      flex: 1 1 300px;
    }
    
    .form-field-small {
      flex: 0 1 150px;
    }
    
    .form-field-large {
      flex: 3 1 300px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .button-container {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
    
    .responsavel-container {
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }
    
    .responsavel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .responsavel-header h4 {
      margin: 0;
    }
    
    .responsavel-divider {
      margin: 24px 0;
    }
    
    .add-responsavel {
      margin: 20px 0;
    }
    
    .permissions-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    
    .hint-text {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      margin-top: -8px;
      margin-bottom: 16px;
    }
    
    .documento-upload {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .documento-tipo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px dashed #ccc;
      border-radius: 4px;
    }
    
    .upload-controls {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
    
    .file-selected {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #4caf50;
    }
    
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }
      
      .documento-tipo {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class AlunoFormComponent implements OnInit {
  alunoForm: FormGroup;
  dadosPessoaisForm: FormGroup;
  responsaveisForm: FormGroup;
  
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  isCepLoading = false;
  
  get responsaveis() {
    return this.responsaveisForm.get('responsaveis') as FormArray;
  }
  
  // Criar um grupo de formulário para um responsável
  createResponsavelFormGroup(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      cpf: [''],
      grauParentesco: ['', Validators.required],
      email: ['', Validators.email],
      telefone: ['', Validators.required],
      permissaoRetirarAluno: [true],
      permissaoReceberNotificacoes: [true],
      permissaoAutorizarAtividades: [false]
    });
  }
  
  // Adicionar novo responsável
  adicionarResponsavel(): void {
    if (this.responsaveis.length < 3) {
      this.responsaveis.push(this.createResponsavelFormGroup());
    } else {
      this.snackBar.open('Limite máximo de 3 responsáveis atingido', 'Fechar', { duration: 3000 });
    }
  }
  
  // Remover um responsável
  removerResponsavel(index: number): void {
    if (index > 0) { // Manter ao menos um responsável
      this.responsaveis.removeAt(index);
    }
  }
  
  // Buscar endereço pelo CEP
  buscarCep(): void {
    const cep = this.dadosPessoaisForm.get('cep')?.value;
    if (!cep) {
      this.snackBar.open('Informe um CEP', 'Fechar', { duration: 3000 });
      return;
    }
    
    // Limpar formatação do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      this.snackBar.open('CEP inválido', 'Fechar', { duration: 3000 });
      return;
    }
    
    this.isCepLoading = true;
    this.cepService.buscarCep(cepLimpo)
      .pipe(
        finalize(() => this.isCepLoading = false),
        catchError(error => {
          this.snackBar.open('Erro ao buscar CEP. Verifique se o CEP é válido.', 'Fechar', { duration: 5000 });
          console.error('Erro na busca de CEP:', error);
          return of(null);
        })
      )
      .subscribe(endereco => {
        if (endereco) {
          this.dadosPessoaisForm.patchValue({
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf
          });
          
          // Foco no campo de número após preenchimento
          setTimeout(() => {
            document.getElementById('numero')?.focus();
          }, 100);
        }
      });
  }
  
  // Tratar seleção de arquivos
  onFileSelected(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Verificar tamanho do arquivo (limite de 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      this.snackBar.open('O arquivo é muito grande. O tamanho máximo é 5MB.', 'Fechar', { duration: 5000 });
      // Limpar o input
      input.value = '';
      return;
    }
    
    // Armazenar o arquivo no formulário
    const documentosGroup = this.alunoForm.get('documentos') as FormGroup;
    documentosGroup.get(campo)?.setValue(file);
  }
  
  // Enviar formulário
  onSubmit(): void {
    // Verificar validade dos formulários
    if (this.dadosPessoaisForm.invalid) {
      this.snackBar.open('Existem erros no formulário de dados pessoais. Verifique os campos destacados.', 'Fechar', { duration: 5000 });
      return;
    }
    
    if (this.responsaveisForm.invalid) {
      this.snackBar.open('Existem erros no formulário de responsáveis. Verifique os campos destacados.', 'Fechar', { duration: 5000 });
      return;
    }
    
    // Preparar dados para envio
    const dadosPessoais = this.dadosPessoaisForm.getRawValue();
    const responsaveis = this.responsaveisForm.value.responsaveis.map((resp: any) => ({
      nome: resp.nome,
      cpf: resp.cpf,
      grauParentesco: resp.grauParentesco,
      email: resp.email,
      telefone: resp.telefone,
      permissoes: {
        retirarAluno: resp.permissaoRetirarAluno,
        receberNotificacoes: resp.permissaoReceberNotificacoes,
        autorizarAtividades: resp.permissaoAutorizarAtividades
      }
    }));
    
    // Criar objeto do aluno
    const aluno = {
      id: this.isEditMode ? parseInt(this.route.snapshot.paramMap.get('id') || '0') : undefined,
      nome: dadosPessoais.nome,
      dataNascimento: dadosPessoais.dataNascimento,
      cpf: dadosPessoais.cpf,
      email: dadosPessoais.email,
      telefonePrincipal: dadosPessoais.telefonePrincipal,
      telefoneAdicional: dadosPessoais.telefoneAdicional,
      endereco: {
        cep: dadosPessoais.cep,
        logradouro: dadosPessoais.logradouro,
        numero: dadosPessoais.numero,
        complemento: dadosPessoais.complemento,
        bairro: dadosPessoais.bairro,
        cidade: dadosPessoais.cidade,
        estado: dadosPessoais.estado
      },
      informacoesMedicas: dadosPessoais.informacoesMedicas,
      necessidadesEspeciais: dadosPessoais.necessidadesEspeciais,
      responsaveis: responsaveis,
      observacoes: this.alunoForm.value.observacoes,
      observacaoConfidencial: this.alunoForm.value.observacaoConfidencial
    };
    
    // Preparar arquivos para upload
    const formData = new FormData();
    formData.append('aluno', JSON.stringify(aluno));
    
    const documentos = this.alunoForm.get('documentos')?.value;
    if (documentos.documentoIdentidade) {
      formData.append('documentoIdentidade', documentos.documentoIdentidade);
    }
    if (documentos.comprovanteResidencia) {
      formData.append('comprovanteResidencia', documentos.comprovanteResidencia);
    }
    if (documentos.fotoAluno) {
      formData.append('fotoAluno', documentos.fotoAluno);
    }
    if (documentos.documentoAdicional) {
      formData.append('documentoAdicional', documentos.documentoAdicional);
    }
    
    // Enviar dados
    this.isSubmitting = true;
    const request = this.isEditMode ? 
      this.alunoService.atualizarAluno(formData) : 
      this.alunoService.criarAluno(formData);
    
    request.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        const mensagem = this.isEditMode ? 
          'Aluno atualizado com sucesso!' : 
          'Aluno cadastrado com sucesso!';
        
        this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
        this.router.navigate(['/alunos']);
      },
      error: (error) => {
        console.error('Erro ao salvar aluno:', error);
        let mensagemErro = 'Ocorreu um erro ao salvar os dados do aluno.';
        
        if (error?.error?.message) {
          mensagemErro = error.error.message;
        }
        
        this.snackBar.open(mensagemErro, 'Fechar', { duration: 5000 });
      }
    });
  }
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private alunoService: AlunoService,
    private cepService: CEPService
  ) {
    // Inicializar formulário principal
    this.alunoForm = this.fb.group({
      observacoes: [''],
      observacaoConfidencial: [false],
      documentos: this.fb.group({
        documentoIdentidade: [null],
        comprovanteResidencia: [null],
        fotoAluno: [null],
        documentoAdicional: [null]
      })
    });
    
    // Inicializar formulário de dados pessoais
    this.dadosPessoaisForm = this.fb.group({
      nome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      idade: [{ value: '', disabled: true }],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefonePrincipal: ['', Validators.required],
      telefoneAdicional: [''],
      cep: ['', Validators.required],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      informacoesMedicas: [''],
      necessidadesEspeciais: ['']
    });
    
    // Inicializar formulário de responsáveis
    this.responsaveisForm = this.fb.group({
      responsaveis: this.fb.array([this.createResponsavelFormGroup()])
    });
  }
  
  ngOnInit(): void {
    // Verificar se estamos em modo de edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadAluno(parseInt(id));
    }
    
    // Monitorar alterações na data de nascimento para calcular a idade
    this.dadosPessoaisForm.get('dataNascimento')?.valueChanges.subscribe(data => {
      if (data) {
        const dataNascimento = new Date(data);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        
        // Ajustar idade se aniversário ainda não ocorreu este ano
        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        const mesNascimento = dataNascimento.getMonth();
        const diaNascimento = dataNascimento.getDate();
        
        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
          idade--;
        }
        
        this.dadosPessoaisForm.get('idade')?.setValue(idade);
      }
    });
  }
  
  // Carregar aluno para edição
  loadAluno(id: number): void {
    this.isLoading = true;
    this.alunoService.getAlunoPorId(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (aluno) => {
          // Preencher formulário de dados pessoais
          this.dadosPessoaisForm.patchValue({
            nome: aluno.nome,
            dataNascimento: aluno.dataNascimento,
            cpf: aluno.cpf,
            email: aluno.email,
            telefonePrincipal: aluno.telefonePrincipal,
            telefoneAdicional: aluno.telefoneAdicional,
            cep: aluno.endereco.cep,
            logradouro: aluno.endereco.logradouro,
            numero: aluno.endereco.numero,
            complemento: aluno.endereco.complemento,
            bairro: aluno.endereco.bairro,
            cidade: aluno.endereco.cidade,
            estado: aluno.endereco.estado,
            informacoesMedicas: aluno.informacoesMedicas,
            necessidadesEspeciais: aluno.necessidadesEspeciais
          });
          
          // Limpar e preencher responsáveis
          while (this.responsaveis.length > 0) {
            this.responsaveis.removeAt(0);
          }
          
          if (aluno.responsaveis && aluno.responsaveis.length > 0) {
            aluno.responsaveis.forEach(responsavel => {
              const responsavelForm = this.createResponsavelFormGroup();
              responsavelForm.patchValue({
                nome: responsavel.nome,
                cpf: responsavel.cpf,
                grauParentesco: responsavel.grauParentesco,
                email: responsavel.email,
                telefone: responsavel.telefone,
                permissaoRetirarAluno: responsavel.permissoes?.retirarAluno || false,
                permissaoReceberNotificacoes: responsavel.permissoes?.receberNotificacoes || false,
                permissaoAutorizarAtividades: responsavel.permissoes?.autorizarAtividades || false
              });
              this.responsaveis.push(responsavelForm);
            });
          } else {
            // Adicionar formulário vazio se não houver responsáveis
            this.responsaveis.push(this.createResponsavelFormGroup());
          }
          
          // Preencher observações
          this.alunoForm.patchValue({
            observacoes: aluno.observacoes,
            observacaoConfidencial: aluno.observacaoConfidencial
          });
        },
        error: (error) => {
          this.snackBar.open('Erro ao carregar dados do aluno', 'Fechar', { duration: 5000 });
          console.error('Erro ao carregar aluno:', error);
        }
      });
  }
}
