// backend/internal/api/handlers/skill_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// SkillHandler gerencia skills e habilidades dos professores
type SkillHandler struct {
	db *gorm.DB
}

// NewSkillHandler cria um novo handler
func NewSkillHandler(db *gorm.DB) *SkillHandler {
	return &SkillHandler{db: db}
}

// ListSkills lista todas as skills disponíveis
// GET /api/v1/skills
func (h *SkillHandler) ListSkills(w http.ResponseWriter, r *http.Request) {
	var skills []models.Skill
	if err := h.db.Order("domain, name").Find(&skills).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(skills)
}

// CreateSkill cria uma nova skill
// POST /api/v1/admin/skills
func (h *SkillHandler) CreateSkill(w http.ResponseWriter, r *http.Request) {
	var skill models.Skill
	if err := json.NewDecoder(r.Body).Decode(&skill); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if skill.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	if err := h.db.Create(&skill).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(skill)
}

// GetTeacherSkills lista as skills de um professor
// GET /api/v1/teachers/:id/skills
func (h *SkillHandler) GetTeacherSkills(w http.ResponseWriter, r *http.Request) {
	teacherID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid teacher id", http.StatusBadRequest)
		return
	}

	var teacherSkills []models.TeacherSkill
	if err := h.db.Where("teacher_id = ?", teacherID).
		Preload("Skill").
		Find(&teacherSkills).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teacherSkills)
}

// AddTeacherSkill adiciona uma skill a um professor
// POST /api/v1/teachers/:id/skills
func (h *SkillHandler) AddTeacherSkill(w http.ResponseWriter, r *http.Request) {
	teacherID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid teacher id", http.StatusBadRequest)
		return
	}

	var req struct {
		SkillID uint   `json:"skillId"`
		Level   string `json:"level"` // beginner, intermediate, advanced, expert
		Notes   string `json:"notes"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.SkillID == 0 {
		http.Error(w, "skillId is required", http.StatusBadRequest)
		return
	}

	// Verificar se já existe
	var existing models.TeacherSkill
	if err := h.db.Where("teacher_id = ? AND skill_id = ?", teacherID, req.SkillID).
		First(&existing).Error; err == nil {
		http.Error(w, "teacher already has this skill", http.StatusConflict)
		return
	}

	teacherSkill := models.TeacherSkill{
		TeacherID: uint(teacherID),
		SkillID:   req.SkillID,
		Level:     req.Level,
		Notes:     req.Notes,
	}

	if err := h.db.Create(&teacherSkill).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(teacherSkill)
}

// RemoveTeacherSkill remove uma skill de um professor
// DELETE /api/v1/teachers/:id/skills/:skillId
func (h *SkillHandler) RemoveTeacherSkill(w http.ResponseWriter, r *http.Request) {
	teacherID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid teacher id", http.StatusBadRequest)
		return
	}

	skillID, err := strconv.ParseUint(chi.URLParam(r, "skillId"), 10, 32)
	if err != nil {
		http.Error(w, "invalid skill id", http.StatusBadRequest)
		return
	}

	if err := h.db.Where("teacher_id = ? AND skill_id = ?", teacherID, skillID).
		Delete(&models.TeacherSkill{}).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// FindSubstituteTeachers busca professores substitutos compatíveis
// GET /api/v1/course-classes/:id/substitutes
func (h *SkillHandler) FindSubstituteTeachers(w http.ResponseWriter, r *http.Request) {
	classID, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		http.Error(w, "invalid class id", http.StatusBadRequest)
		return
	}

	// Buscar turma
	var class models.CourseClass
	if err := h.db.Preload("Course").First(&class, classID).Error; err != nil {
		http.Error(w, "class not found", http.StatusNotFound)
		return
	}

	// Buscar professores ativos
	var teachers []models.Teacher
	if err := h.db.Where("active = ?", true).
		Preload("User").
		Preload("Skills").
		Preload("Skills.Skill").
		Preload("Availability").
		Find(&teachers).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Calcular score para cada professor
	type SubstituteCandidate struct {
		models.Teacher
		Score       int    `json:"score"`
		SkillMatch  string `json:"skillMatch"`
		HasConflict bool   `json:"hasConflict"`
		Available   bool   `json:"available"`
	}

	var candidates []SubstituteCandidate

	for _, teacher := range teachers {
		// Pular professor padrão da turma
		if class.DefaultTeacherID != nil && teacher.ID == *class.DefaultTeacherID {
			continue
		}

		score := 0
		skillMatch := "none"

		// Verificar skills compatíveis (simplificado - na prática verificaria por categoria)
		for range teacher.Skills {
			score += 10 // Pontos por cada skill
			if skillMatch == "none" {
				skillMatch = "partial"
			}
		}

		// Verificar disponibilidade (simplificado)
		available := len(teacher.Availability) > 0
		if available {
			score += 20
		}

		candidates = append(candidates, SubstituteCandidate{
			Teacher:     teacher,
			Score:       score,
			SkillMatch:  skillMatch,
			HasConflict: false, // TODO: verificar conflitos reais
			Available:   available,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(candidates)
}

// RegisterRoutes registra as rotas de skills
func (h *SkillHandler) RegisterRoutes(r chi.Router) {
	// Rotas públicas (autenticadas)
	r.Route("/skills", func(r chi.Router) {
		r.Get("/", h.ListSkills)
	})

	// Rotas por professor
	r.Route("/teachers/{id}/skills", func(r chi.Router) {
		r.Get("/", h.GetTeacherSkills)
		r.Post("/", h.AddTeacherSkill)
		r.Delete("/{skillId}", h.RemoveTeacherSkill)
	})

	// Rotas admin
	r.Route("/admin/skills", func(r chi.Router) {
		r.Post("/", h.CreateSkill)
	})

	// Substitutos
	r.Get("/course-classes/{id}/substitutes", h.FindSubstituteTeachers)
}
