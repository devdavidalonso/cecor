package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/gin-gonic/gin"
)

// RegisterCourseAttendance registra presença para todos os alunos em um curso
func RegisterCourseAttendance(attendanceRepo *repositories.AttendanceRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		courseIDStr := c.Param("id")
		dateStr := c.Param("date")

		// Converter courseID para uint
		courseIDInt, err := strconv.Atoi(courseIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
			return
		}
		courseID := uint(courseIDInt)

		// Converter data
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use AAAA-MM-DD"})
			return
		}

		// Estrutura para receber dados
		var request struct {
			Attendances []struct {
				StudentID     uint   `json:"student_id" binding:"required"`
				Status        string `json:"status" binding:"required,oneof=present absent partial"`
				Justification string `json:"justification"`
				Module        string `json:"module"`
				Notes         string `json:"notes"`
			} `json:"attendances" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
			return
		}

		// Obter ID do usuário autenticado (professor)
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		// Preparar registros de presença
		attendances := make([]models.Attendance, 0, len(request.Attendances))

		for _, a := range request.Attendances {
			attendance := models.Attendance{
				StudentID:      a.StudentID,
				CourseID:       courseID,
				Date:           date,
				Status:         a.Status,
				Module:         a.Module,
				Justification:  a.Justification,
				Notes:          a.Notes,
				RegisteredByID: userID,
			}
			attendances = append(attendances, attendance)
		}

		// Registrar presenças
		if err := attendanceRepo.RegisterCourseAttendance(courseID, date, attendances); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar presenças", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "Presenças registradas com sucesso",
			"course_id": courseID,
			"date":      date.Format("2006-01-02"),
			"total":     len(attendances),
		})
	}
}

// GetCourseAttendance obtém registros de presença para um curso em uma data específica
func GetCourseAttendance(attendanceRepo *repositories.AttendanceRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		courseIDStr := c.Param("id")
		dateStr := c.Param("date")

		// Converter courseID para uint
		courseIDInt, err := strconv.Atoi(courseIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
			return
		}
		courseID := uint(courseIDInt)

		// Converter data
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use AAAA-MM-DD"})
			return
		}

		// Obter presenças
		attendances, err := attendanceRepo.FindAttendancesByCourseDate(courseID, date)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar registros de presença"})
			return
		}

		c.JSON(http.StatusOK, attendances)
	}
}

// GetStudentAttendance obtém todos os registros de presença de um aluno em um curso
func GetStudentAttendance(attendanceRepo *repositories.AttendanceRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		studentIDStr := c.Param("studentId")
		courseIDStr := c.Param("courseId")

		// Converter IDs para uint
		studentIDInt, err := strconv.Atoi(studentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de aluno inválido"})
			return
		}
		studentID := uint(studentIDInt)

		courseIDInt, err := strconv.Atoi(courseIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
			return
		}
		courseID := uint(courseIDInt)

		// Obter presenças
		attendances, err := attendanceRepo.FindByStudentAndCourse(studentID, courseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar registros de presença"})
			return
		}

		// Calcular estatísticas
		total := len(attendances)
		present := 0
		absent := 0
		partial := 0

		for _, a := range attendances {
			switch a.Status {
			case "present":
				present++
			case "absent":
				absent++
			case "partial":
				partial++
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"attendances": attendances,
			"statistics": gin.H{
				"total":      total,
				"present":    present,
				"absent":     absent,
				"partial":    partial,
				"percentage": fmt.Sprintf("%.1f%%", float64(present+partial/2)*100/float64(total)),
			},
		})
	}
}
