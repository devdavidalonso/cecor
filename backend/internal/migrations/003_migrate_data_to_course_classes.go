// backend/internal/migrations/003_migrate_data_to_course_classes.go
package migrations

import (
	"fmt"
	"log"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"gorm.io/gorm"
)

// MigrateDataToCourseClasses converte dados do modelo antigo para o novo
// Cria uma turma padrão para cada curso existente
func MigrateDataToCourseClasses(db *gorm.DB) error {
	log.Println("🚀 Iniciando migração de dados: Course → CourseClass...")

	// 1. Buscar todos os cursos existentes
	var courses []models.Course
	if err := db.Find(&courses).Error; err != nil {
		return fmt.Errorf("erro ao buscar cursos: %w", err)
	}

	log.Printf("📊 Encontrados %d cursos para migrar", len(courses))

	// 2. Para cada curso, criar uma turma padrão
	for _, course := range courses {
		if err := migrateCourse(db, course); err != nil {
			log.Printf("❌ Erro ao migrar curso %d (%s): %v", course.ID, course.Name, err)
			// Continua com o próximo, não interrompe
			continue
		}
	}

	// 3. Migrar class_sessions para apontar para course_classes
	if err := migrateClassSessions(db); err != nil {
		return fmt.Errorf("erro ao migrar class_sessions: %w", err)
	}

	log.Println("✅ Migração de dados concluída!")
	return nil
}

func migrateCourse(db *gorm.DB, course models.Course) error {
	// Verificar se já existe turma para este curso
	var existingClass models.CourseClass
	if err := db.Where("course_id = ? AND code = ?", course.ID, "2026A").First(&existingClass).Error; err == nil {
		log.Printf("⚠️  Curso %d (%s) já tem turma, pulando...", course.ID, course.Name)
		return nil
	}

	// Criar turma padrão com dados do curso
	class := models.CourseClass{
		CourseID:           course.ID,
		Code:               "2026A",
		Name:               course.Name + " - Turma A",
		WeekDays:           course.WeekDays,
		StartTime:          course.StartTime,
		EndTime:            course.EndTime,
		StartDate:          course.StartDate,
		EndDate:            course.EndDate,
		Capacity:           course.MaxStudents,
		MaxStudents:        course.MaxStudents,
		GoogleClassroomURL: course.GoogleClassroomURL,
		GoogleClassroomID:  course.GoogleClassroomID,
		Status:             course.Status,
	}

	// Buscar teacher padrão do curso (se houver)
	var teacherCourse models.TeacherCourse
	if err := db.Where("course_id = ? AND role = ? AND active = ?", 
		course.ID, "primary", true).
		First(&teacherCourse).Error; err == nil {
		class.DefaultTeacherID = &teacherCourse.TeacherID
	}

	if err := db.Create(&class).Error; err != nil {
		return fmt.Errorf("erro ao criar turma: %w", err)
	}

	log.Printf("✅ Turma criada para curso %d (%s): ID=%d", course.ID, course.Name, class.ID)

	// Migrar matrículas para a nova tabela pivô
	if err := migrateEnrollments(db, course.ID, class.ID); err != nil {
		return fmt.Errorf("erro ao migrar matrículas: %w", err)
	}

	return nil
}

func migrateEnrollments(db *gorm.DB, courseID uint, classID uint) error {
	var enrollments []models.Enrollment
	if err := db.Where("course_id = ?", courseID).Find(&enrollments).Error; err != nil {
		return err
	}

	for _, enrollment := range enrollments {
		// Verificar se já existe na tabela pivô
		var existing models.EnrollmentCourseClass
		if err := db.Where("enrollment_id = ? AND course_class_id = ?", 
			enrollment.ID, classID).First(&existing).Error; err == nil {
			continue // Já migrado
		}

		// Criar registro na tabela pivô
		ecc := models.EnrollmentCourseClass{
			EnrollmentID:  enrollment.ID,
			CourseClassID: classID,
			IsPrimary:     true,
			Notes:         "Migração automática: " + time.Now().Format("2006-01-02"),
		}

		if err := db.Create(&ecc).Error; err != nil {
			log.Printf("⚠️  Erro ao criar pivô para enrollment %d: %v", enrollment.ID, err)
			continue
		}
	}

	log.Printf("  📋 %d matrículas migradas para turma %d", len(enrollments), classID)
	return nil
}

func migrateClassSessions(db *gorm.DB) error {
	// Buscar todos os class_sessions que ainda não têm course_class_id
	var sessions []models.ClassSession
	if err := db.Where("course_class_id IS NULL").Find(&sessions).Error; err != nil {
		return err
	}

	log.Printf("📅 Migrando %d aulas sem turma associada...", len(sessions))

	for _, session := range sessions {
		// Buscar a turma padrão do curso
		var class models.CourseClass
		if err := db.Where("course_id = ? AND code = ?", session.CourseID, "2026A").
			First(&class).Error; err != nil {
			log.Printf("⚠️  Não encontrou turma para curso %d, aula %d", session.CourseID, session.ID)
			continue
		}

		// Atualizar aula com course_class_id
		if err := db.Model(&session).Update("course_class_id", class.ID).Error; err != nil {
			log.Printf("⚠️  Erro ao atualizar aula %d: %v", session.ID, err)
			continue
		}
	}

	log.Printf("✅ %d aulas migradas", len(sessions))
	return nil
}

// RollbackCourseClassesMigration remove dados migrados (cuidado!)
func RollbackCourseClassesMigration(db *gorm.DB) error {
	log.Println("⚠️  Iniciando ROLLBACK da migração de CourseClasses...")

	// 1. Remover registros da tabela pivô
	if err := db.Exec("DELETE FROM enrollment_course_classes WHERE notes LIKE 'Migração automática%'").Error; err != nil {
		return err
	}
	log.Println("🗑️  Registros da tabela pivô removidos")

	// 2. Zerar course_class_id nas aulas
	if err := db.Exec("UPDATE class_sessions SET course_class_id = NULL").Error; err != nil {
		return err
	}
	log.Println("🗑️  course_class_id zerado nas aulas")

	// 3. Remover turmas criadas na migração
	if err := db.Exec("DELETE FROM course_classes WHERE code = '2026A'").Error; err != nil {
		return err
	}
	log.Println("🗑️  Turmas de migração removidas")

	log.Println("✅ Rollback concluído!")
	return nil
}
