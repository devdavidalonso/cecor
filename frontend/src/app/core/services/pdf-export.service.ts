// src/app/core/services/pdf-export.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { InterviewResponse } from '../models/interview.model';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  
  exportInterviewResponse(
    response: InterviewResponse, 
    student: Student | null, 
    questionLabels: { key: string; label: string }[],
    formTitle: string
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(0, 106, 172);
    doc.text('CECOR - Entrevista Socioeducacional', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(formTitle, pageWidth / 2, yPosition, { align: 'center' });

    // Linha divisória
    yPosition += 10;
    doc.setDrawColor(0, 106, 172);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    // Informações do Aluno
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Informações do Aluno', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    
    if (student) {
      doc.setFont('helvetica', 'bold');
      doc.text('Nome:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(student.user?.name || 'N/A', margin + 30, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Matrícula:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(student.registrationNumber || 'N/A', margin + 30, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Email:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(student.user?.email || 'N/A', margin + 30, yPosition);
    }

    // Data da entrevista
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Data da Entrevista:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const dateStr = response.completionDate 
      ? new Date(response.completionDate).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');
    doc.text(dateStr, margin + 45, yPosition);

    // Linha divisória
    yPosition += 12;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);

    // Respostas
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Respostas da Entrevista', margin, yPosition);

    yPosition += 10;
    doc.setFontSize(10);

    questionLabels.forEach((question, index) => {
      // Verificar se precisa de nova página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const answer = response.answers[question.key];
      
      // Pergunta
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 106, 172);
      doc.text(`${index + 1}. ${question.label}`, margin, yPosition);

      // Resposta
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      let answerText = this.formatAnswer(answer);
      
      // Quebrar texto longo em múltiplas linhas
      const maxWidth = pageWidth - (margin * 2);
      const splitText = doc.splitTextToSize(answerText, maxWidth);
      doc.text(splitText, margin + 5, yPosition);
      
      yPosition += (splitText.length * 5) + 5;
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `CECOR - Lar do Alvorecer Marlene Nobre | Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Salvar PDF
    const fileName = `entrevista_${student?.user?.name?.replace(/\s+/g, '_').toLowerCase() || response.studentId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private formatAnswer(answer: any): string {
    if (answer === null || answer === undefined) {
      return 'Não informado';
    }
    
    if (typeof answer === 'boolean') {
      return answer ? 'Sim' : 'Não';
    }
    
    if (Array.isArray(answer)) {
      if (answer.length === 0) {
        return 'Nenhuma opção selecionada';
      }
      return answer.join(', ');
    }
    
    if (typeof answer === 'string' && answer.trim() === '') {
      return 'Não informado';
    }
    
    return String(answer);
  }
}
