// backend/internal/migrations/002_create_course_classes_and_skills.go
package migrations

import (
	"log"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"gorm.io/gorm"
)

// MigrateCourseClassesAndSkills cria as tabelas para:
// - CourseClass (Turmas)
// - CourseCategory (Categorias de curso)
// - EnrollmentCourseClass (Pivô)
// - SyllabusTopic (Ementas)
// - Skill, TeacherSkill (Skills)
// - TeacherAvailability (Disponibilidade)
// - TeacherAbsence, Substitution (Substituição)
func MigrateCourseClassesAndSkills(db *gorm.DB) error {
	log.Println("🚀 Iniciando migração: Course Classes, Skills e Substituição...")

	// Criar tabelas NOVAS (não altera existentes)
	modelList := []interface{}{
		&models.CourseClass{},
		&models.CourseCategory{},
		&models.EnrollmentCourseClass{},
		&models.SyllabusTopic{},
		&models.Skill{},
		&models.TeacherSkill{},
		&models.TeacherAvailability{},
		&models.TeacherAbsence{},
		&models.Substitution{},
	}

	for _, model := range modelList {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("❌ Erro ao criar tabela para %T: %v", model, err)
			return err
		}
		log.Printf("✅ Tabela criada: %T", model)
	}

	// Adicionar coluna course_class_id em class_sessions (nullable, para backward compatibility)
	var classSession models.ClassSession
	if !db.Migrator().HasColumn(&classSession, "course_class_id") {
		if err := db.Exec("ALTER TABLE class_sessions ADD COLUMN course_class_id INTEGER NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna course_class_id: %v", err)
			return err
		}
		log.Println("✅ Coluna course_class_id adicionada em class_sessions")
	}

	// Adicionar coluna teacher_id em class_sessions (nullable, para substituições)
	if !db.Migrator().HasColumn(&classSession, "teacher_id") {
		if err := db.Exec("ALTER TABLE class_sessions ADD COLUMN teacher_id INTEGER NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna teacher_id: %v", err)
			return err
		}
		log.Println("✅ Coluna teacher_id adicionada em class_sessions")
	}

	// Adicionar coluna syllabus_topic_id em class_sessions (nullable)
	if !db.Migrator().HasColumn(&classSession, "syllabus_topic_id") {
		if err := db.Exec("ALTER TABLE class_sessions ADD COLUMN syllabus_topic_id INTEGER NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna syllabus_topic_id: %v", err)
			return err
		}
		log.Println("✅ Coluna syllabus_topic_id adicionada em class_sessions")
	}

	// Adicionar coluna start_time em class_sessions (nullable)
	if !db.Migrator().HasColumn(&classSession, "start_time") {
		if err := db.Exec("ALTER TABLE class_sessions ADD COLUMN start_time VARCHAR(5) NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna start_time: %v", err)
			return err
		}
		log.Println("✅ Coluna start_time adicionada em class_sessions")
	}

	// Adicionar coluna end_time em class_sessions (nullable)
	if !db.Migrator().HasColumn(&classSession, "end_time") {
		if err := db.Exec("ALTER TABLE class_sessions ADD COLUMN end_time VARCHAR(5) NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna end_time: %v", err)
			return err
		}
		log.Println("✅ Coluna end_time adicionada em class_sessions")
	}

	// Adicionar coluna topic_override em class_sessions (nullable)
	if !db.Migrator().HasColumn(&classSession, "topic_override") {
		if err := db.Exec("ALTER TABLE class_sessions ADD COLUMN topic_override TEXT NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna topic_override: %v", err)
			return err
		}
		log.Println("✅ Coluna topic_override adicionada em class_sessions")
	}

	// Adicionar coluna category_id em courses (nullable)
	var course models.Course
	if !db.Migrator().HasColumn(&course, "category_id") {
		if err := db.Exec("ALTER TABLE courses ADD COLUMN category_id INTEGER NULL").Error; err != nil {
			log.Printf("❌ Erro ao adicionar coluna category_id: %v", err)
			return err
		}
		log.Println("✅ Coluna category_id adicionada em courses")
	}

	// Criar índices para performance
	indexes := []struct {
		table string
		col   string
	}{
		{"class_sessions", "course_class_id"},
		{"class_sessions", "teacher_id"},
		{"class_sessions", "syllabus_topic_id"},
		{"courses", "category_id"},
	}

	for _, idx := range indexes {
		indexName := "idx_" + idx.table + "_" + idx.col
		if err := db.Exec("CREATE INDEX IF NOT EXISTS " + indexName + " ON " + idx.table + "(" + idx.col + ")").Error; err != nil {
			log.Printf("⚠️  Não foi possível criar índice %s: %v", indexName, err)
			// Não retorna erro, índice é opcional
		}
	}

	log.Println("✅ Migração concluída com sucesso!")
	return nil
}
