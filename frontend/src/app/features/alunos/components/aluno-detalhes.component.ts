// src/app/features/alunos/components/aluno-detalhes.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';

import { AlunoService, Aluno } from '../../../core/services/aluno.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-aluno-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatExpansionModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aluno-detalhes.component.html',
  styleUrls: ['./aluno-detalhes.component.scss']
})
export class AlunoDetalhesComponent implements OnInit {
  alunoId!: number;
  aluno: Aluno | null = null;
  isLoading = false;
  
  // Dados para matrículas
  matriculas = [
    { id: 1, curso: 'Informática Básica', dataInicio: new Date('2023-02-01'), dataFim: null, status: 'Ativa' },
    { id: 2, curso: 'Corte e Costura', dataInicio: new Date('2023-02-15'), dataFim: new Date('2023-06-30'), status: 'Concluída' }
  ];
  
  matriculasColumns = ['curso', 'dataInicio', 'dataFim', 'status', 'acoes'];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alunoService: AlunoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.alunoId = parseInt(id);
        this.carregarAluno();
      }
    });
  }
  
  /**
   * Carrega os dados do aluno
   */
  carregarAluno(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.alunoService.getAlunoPorId(this.alunoId)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (aluno) => {
          this.aluno = this.processarDadosAluno(aluno);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar aluno:', error);
          this.snackBar.open('Erro ao carregar dados do aluno. Tente novamente mais tarde.', 'Fechar', { duration: 5000 });
        }
      });
  }
  
  /**
   * Processa os dados do aluno, calculando idade e outros valores derivados
   */
  processarDadosAluno(aluno: Aluno): Aluno {
    // Calcular idade
    if (aluno.dataNascimento) {
      const hoje = new Date();
      const dataNascimento = new Date(aluno.dataNascimento);
      let idade = hoje.getFullYear() - dataNascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const diaAtual = hoje.getDate();
      const mesNascimento = dataNascimento.getMonth();
      const diaNascimento = dataNascimento.getDate();
      
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
        idade--;
      }
      
      aluno.idade = idade;
    }
    
    return aluno;
  }
  
  /**
   * Determina o tipo de documento baseado na extensão
   */
  getDocumentoTipo(nome: string): string {
    if (!nome) return 'unknown';
    
    const extensao = nome.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extensao || '')) {
      return 'image';
    } else if (['pdf'].includes(extensao || '')) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extensao || '')) {
      return 'word';
    } else if (['xls', 'xlsx', 'csv'].includes(extensao || '')) {
      return 'excel';
    } else {
      return 'unknown';
    }
  }
  
  /**
   * Retorna a cor para o status da matrícula
   */
  getMatriculaStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'ativa':
      case 'em curso':
        return 'primary';
      case 'concluída':
        return 'accent';
      case 'cancelada':
      case 'trancada':
        return 'warn';
      default:
        return 'primary';
    }
  }
  
  /**
   * Verifica se um documento específico existe
   */
  hasFotoAluno(): boolean {
    return !!this.aluno?.documentos?.find(d => d.tipo === 'fotoAluno');
  }
  
  /**
   * Obtém a URL da foto do aluno
   */
  getFotoAlunoUrl(): string {
    return this.aluno?.documentos?.find(d => d.tipo === 'fotoAluno')?.url || '';
  }
  
  /**
   * Exclui o aluno atual
   */
  excluirAluno(): void {
    if (confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      this.alunoService.excluirAluno(this.alunoId)
        .subscribe({
          next: () => {
            this.snackBar.open('Aluno excluído com sucesso', 'Fechar', { duration: 3000 });
            this.router.navigate(['/alunos']);
          },
          error: (error) => {
            console.error('Erro ao excluir aluno:', error);
            this.snackBar.open('Erro ao excluir aluno. Tente novamente mais tarde.', 'Fechar', { duration: 5000 });
          }
        });
    }
  }
}