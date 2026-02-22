// backend/internal/api/handlers/migration_handler.go
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/devdavidalonso/cecor/backend/internal/migrations"
	"gorm.io/gorm"
)

// MigrationHandler gerencia endpoints de migração
type MigrationHandler struct {
	db *gorm.DB
}

// NewMigrationHandler cria um novo handler
func NewMigrationHandler(db *gorm.DB) *MigrationHandler {
	return &MigrationHandler{db: db}
}

// RunMigrations executa as migrações de schema
// POST /api/v1/admin/migrations/run
func (h *MigrationHandler) RunMigrations(w http.ResponseWriter, r *http.Request) {
	if err := migrations.MigrateCourseClassesAndSkills(h.db); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Migrations executed successfully",
	})
}

// RunDataMigration executa a migração de dados
// POST /api/v1/admin/migrations/data
func (h *MigrationHandler) RunDataMigration(w http.ResponseWriter, r *http.Request) {
	if err := migrations.MigrateDataToCourseClasses(h.db); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Data migration executed successfully",
	})
}

// RollbackMigrations executa o rollback (CUIDADO!)
// POST /api/v1/admin/migrations/rollback
func (h *MigrationHandler) RollbackMigrations(w http.ResponseWriter, r *http.Request) {
	// TODO: Adicionar confirmação extra ou backup automático
	if err := migrations.RollbackCourseClassesMigration(h.db); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Rollback executed successfully",
	})
}

// GetMigrationStatus retorna status das migrações
// GET /api/v1/admin/migrations/status
func (h *MigrationHandler) GetMigrationStatus(w http.ResponseWriter, r *http.Request) {
	// Verificar se tabelas existem
	var tables []string
	h.db.Raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (?, ?, ?, ?, ?, ?, ?)",
		"course_classes", "course_categories", "enrollment_course_classes",
		"syllabus_topics", "skills", "teacher_skills", "teacher_availability").
		Scan(&tables)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tablesCreated": len(tables),
		"tables":        tables,
		"ready":         len(tables) >= 7,
	})
}
