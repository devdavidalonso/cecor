// internal/services/export_service.go
package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

// GenerateStudentsPDF gera um arquivo PDF com os dados dos alunos
func GenerateStudentsPDF(students []models.Student) ([]byte, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.AddPage()

	// Adicionar título
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Lista de Alunos")
	pdf.Ln(20)

	// Adicionar cabeçalho da tabela
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(10, 10, "ID")
	pdf.Cell(60, 10, "Nome")
	pdf.Cell(40, 10, "Data de Nascimento")
	pdf.Cell(40, 10, "CPF")
	pdf.Cell(40, 10, "Telefone")
	pdf.Cell(60, 10, "Email")
	pdf.Cell(40, 10, "Status")
	pdf.Ln(10)

	// Adicionar dados dos alunos
	pdf.SetFont("Arial", "", 12)
	for _, student := range students {
		pdf.Cell(10, 10, fmt.Sprintf("%d", student.ID))
		pdf.Cell(60, 10, student.User.Name)
		pdf.Cell(40, 10, student.User.BirthDate.Format("02/01/2006"))
		pdf.Cell(40, 10, student.User.CPF)
		pdf.Cell(40, 10, student.User.Phone)
		pdf.Cell(60, 10, student.User.Email)
		pdf.Cell(40, 10, student.Status)
		pdf.Ln(10)
	}

	// Adicionar rodapé com data
	pdf.SetY(-15)
	pdf.SetFont("Arial", "I", 8)
	pdf.Cell(0, 10, fmt.Sprintf("Gerado em %s", time.Now().Format("02/01/2006 15:04:05")))

	// Obter o PDF como bytes
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// GenerateStudentsExcel gera um arquivo Excel com os dados dos alunos
func GenerateStudentsExcel(students []models.Student) ([]byte, error) {
	f := excelize.NewFile()

	// Criar a planilha e definir os cabeçalhos
	sheet := "Alunos"
	f.SetSheetName("Sheet1", sheet)

	// Estilo para cabeçalho
	headerStyle, _ := f.NewStyle(`{
		"font": {"bold": true, "color": "#FFFFFF"},
		"fill": {"type": "pattern", "color": ["#4472C4"], "pattern": 1},
		"alignment": {"horizontal": "center", "vertical": "center"}
	}`)

	// Definir cabeçalhos
	headers := []string{"ID", "Nome", "Data de Nascimento", "Idade", "CPF", "Telefone", "Email", "Endereço", "Matrícula", "Status"}
	for i, header := range headers {
		col := string(rune('A' + i))
		f.SetCellValue(sheet, col+"1", header)
		f.SetCellStyle(sheet, col+"1", col+"1", headerStyle)
	}

	// Adicionar dados dos alunos
	for i, student := range students {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), student.ID)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), student.User.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), student.User.BirthDate.Format("02/01/2006"))

		// Calcular idade
		idade := time.Now().Year() - student.User.BirthDate.Year()
		if time.Now().YearDay() < student.User.BirthDate.YearDay() {
			idade--
		}
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), idade)

		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), student.User.CPF)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), student.User.Phone)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), student.User.Email)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), student.User.Address)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), student.RegistrationNumber)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), student.Status)
	}

	// Ajustar largura das colunas
	for i := range headers {
		col := string(rune('A' + i))
		f.SetColWidth(sheet, col, col, 20)
	}

	// Adicionar filtros nos cabeçalhos
	f.AutoFilter(sheet, "A1", string(rune('A'+len(headers)-1))+fmt.Sprintf("%d", len(students)+1), "")

	// Congelar a linha de cabeçalho
	f.SetPanes(sheet, `{"freeze":true,"split":false,"x_split":0,"y_split":1,"top_left_cell":"A2","active_pane":"bottomLeft"}`)

	// Obter o Excel como bytes
	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// GenerateStudentsCSV gera um arquivo CSV com os dados dos alunos
func GenerateStudentsCSV(students []models.Student) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Escrever cabeçalhos
	headers := []string{"ID", "Nome", "Data de Nascimento", "Idade", "CPF", "Telefone", "Email", "Endereço", "Matrícula", "Status"}
	if err := writer.Write(headers); err != nil {
		return nil, err
	}

	// Escrever dados dos alunos
	for _, student := range students {
		// Calcular idade
		idade := time.Now().Year() - student.User.BirthDate.Year()
		if time.Now().YearDay() < student.User.BirthDate.YearDay() {
			idade--
		}

		row := []string{
			fmt.Sprintf("%d", student.ID),
			student.User.Name,
			student.User.BirthDate.Format("02/01/2006"),
			fmt.Sprintf("%d", idade),
			student.User.CPF,
			student.User.Phone,
			student.User.Email,
			student.User.Address,
			student.RegistrationNumber,
			student.Status,
		}

		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()

	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
