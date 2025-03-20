// internal/api/handlers/user_handlers.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/devdavidalonso/cecor/internal/models"
	"github.com/devdavidalonso/cecor/internal/repositories"
	"github.com/devdavidalonso/cecor/internal/services"
	"github.com/gin-gonic/gin"
)

// GetUserProfile retorna os dados do usuário autenticado
func GetUserProfile(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obter ID do usuário autenticado
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		// Buscar usuário no banco
		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Formatar dados sensíveis
		user.Password = "" // Não enviar senha
		user.CPF = services.FormatCPF(user.CPF)
		user.Phone = services.FormatPhone(user.Phone)

		c.JSON(http.StatusOK, user)
	}
}

// UpdateUserProfile atualiza dados do usuário autenticado
func UpdateUserProfile(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obter ID do usuário autenticado
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		// Buscar usuário no banco
		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Dados que o usuário pode atualizar do próprio perfil
		var input struct {
			Name     string `json:"name"`
			Phone    string `json:"phone"`
			Address  string `json:"address"`
			PhotoURL string `json:"photo_url"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Atualizar dados
		if input.Name != "" {
			user.Name = services.SanitizeName(input.Name)
		}
		if input.Phone != "" {
			if !services.ValidatePhone(input.Phone) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Telefone inválido"})
				return
			}
			user.Phone = services.FormatPhone(input.Phone)
		}
		if input.Address != "" {
			user.Address = input.Address
		}
		if input.PhotoURL != "" {
			user.PhotoURL = input.PhotoURL
		}

		// Salvar alterações
		if err := userRepo.Update(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar usuário"})
			return
		}

		// Remover senha antes de retornar
		user.Password = ""

		c.JSON(http.StatusOK, user)
	}
}

// ChangePassword atualiza a senha do usuário autenticado
func ChangePassword(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obter ID do usuário autenticado
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
			return
		}
		userID := userIDVal.(uint)

		// Parâmetros da requisição
		var input struct {
			CurrentPassword string `json:"current_password" binding:"required"`
			NewPassword     string `json:"new_password" binding:"required,min=6"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Buscar usuário
		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Verificar senha atual
		if !services.CheckPasswordHash(input.CurrentPassword, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha atual incorreta"})
			return
		}

		// Gerar hash da nova senha
		hashedPassword, err := services.HashPassword(input.NewPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar nova senha"})
			return
		}

		// Atualizar senha
		if err := userRepo.ChangePassword(userID, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar senha"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Senha atualizada com sucesso"})
	}
}

// ListAllUsers lista todos os usuários (admin)
func ListAllUsers(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parâmetros de filtro opcionais
		profile := c.Query("profile")

		var users []models.User
		var err error

		if profile != "" {
			users, err = userRepo.FindByProfile(profile)
		} else {
			users, err = userRepo.FindAll()
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários"})
			return
		}

		// Remover senhas
		for i := range users {
			users[i].Password = ""
		}

		c.JSON(http.StatusOK, users)
	}
}

// GetUserDetails retorna detalhes de um usuário específico (admin)
func GetUserDetails(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		user, err := userRepo.FindByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Remover senha
		user.Password = ""

		// Formatar dados
		user.CPF = services.FormatCPF(user.CPF)
		user.Phone = services.FormatPhone(user.Phone)

		c.JSON(http.StatusOK, user)
	}
}

// UpdateUser atualiza um usuário (admin)
func UpdateUser(userRepo *repositories.UserRepository, auditRepo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		userID := uint(id)

		// Buscar usuário original
		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Dados antigos para auditoria
		oldUserJSON, _ := json.Marshal(user)

		// Dados de atualização
		var input struct {
			Name      string     `json:"name"`
			Email     string     `json:"email"`
			CPF       string     `json:"cpf"`
			BirthDate *time.Time `json:"birth_date"`
			Phone     string     `json:"phone"`
			Address   string     `json:"address"`
			PhotoURL  string     `json:"photo_url"`
			Profile   string     `json:"profile"`
			Active    *bool      `json:"active"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validar dados informados
		if input.Email != "" && !services.ValidateEmail(input.Email) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail inválido"})
			return
		}

		if input.CPF != "" && !services.ValidateCPF(input.CPF) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "CPF inválido"})
			return
		}

		if input.Phone != "" && !services.ValidatePhone(input.Phone) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Telefone inválido"})
			return
		}

		// Atualizar dados
		if input.Name != "" {
			user.Name = services.SanitizeName(input.Name)
		}
		if input.Email != "" {
			user.Email = input.Email
		}
		if input.CPF != "" {
			user.CPF = services.FormatCPF(input.CPF)
		}
		if input.BirthDate != nil {
			user.BirthDate = input.BirthDate
		}
		if input.Phone != "" {
			user.Phone = services.FormatPhone(input.Phone)
		}
		if input.Address != "" {
			user.Address = input.Address
		}
		if input.PhotoURL != "" {
			user.PhotoURL = input.PhotoURL
		}
		if input.Profile != "" {
			// Verificar se é um perfil válido
			validProfiles := map[string]bool{
				"admin":     true,
				"aluno":     true,
				"student":   true,
				"teacher":   true,
				"gestor":    true,
				"manager":   true,
				"professor": true,
			}
			if !validProfiles[input.Profile] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Perfil inválido"})
				return
			}
			user.Profile = input.Profile
		}
		if input.Active != nil {
			user.Active = *input.Active
			// Se estiver reativando, limpar DeletedAt
			if *input.Active && user.DeletedAt != nil {
				user.DeletedAt = nil
			}
		}

		// Salvar alterações
		if err := userRepo.Update(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar usuário"})
			return
		}

		// Registrar auditoria
		adminID, exists := c.Get("userID")
		if exists {
			newUserJSON, _ := json.Marshal(user)
			auditLog := models.AuditLog{
				EntityType: "user",
				EntityID:   userID,
				Action:     "update",
				UserID:     adminID.(uint),
				OldData:    string(oldUserJSON),
				NewData:    string(newUserJSON),
				CreatedAt:  time.Now(),
			}
			auditRepo.Create(&auditLog)
		}

		// Remover senha antes de retornar
		user.Password = ""

		c.JSON(http.StatusOK, user)
	}
}

// DeleteUser desativa um usuário (admin)
func DeleteUser(userRepo *repositories.UserRepository, auditRepo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		userID := uint(id)

		// Buscar usuário
		user, err := userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Dados antigos para auditoria
		oldUserJSON, _ := json.Marshal(user)

		// Desativar usuário
		if err := userRepo.Delete(userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar usuário"})
			return
		}

		// Registrar auditoria
		adminID, exists := c.Get("userID")
		if exists {
			auditLog := models.AuditLog{
				EntityType: "user",
				EntityID:   userID,
				Action:     "delete",
				UserID:     adminID.(uint),
				OldData:    string(oldUserJSON),
				CreatedAt:  time.Now(),
			}
			auditRepo.Create(&auditLog)
		}

		c.JSON(http.StatusOK, gin.H{"message": "Usuário desativado com sucesso"})
	}
}

// RestoreUser restaura um usuário desativado (admin)
func RestoreUser(userRepo *repositories.UserRepository, auditRepo *repositories.AuditRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		userID := uint(id)

		// Restaurar usuário
		if err := userRepo.Restore(userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao restaurar usuário"})
			return
		}

		// Registrar auditoria
		adminID, exists := c.Get("userID")
		if exists {
			user, _ := userRepo.FindByID(userID)
			userJSON, _ := json.Marshal(user)

			auditLog := models.AuditLog{
				EntityType: "user",
				EntityID:   userID,
				Action:     "restore",
				UserID:     adminID.(uint),
				NewData:    string(userJSON),
				CreatedAt:  time.Now(),
			}
			auditRepo.Create(&auditLog)
		}

		c.JSON(http.StatusOK, gin.H{"message": "Usuário restaurado com sucesso"})
	}
}

// ResetUserPassword redefine a senha de um usuário (admin)
func ResetUserPassword(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		userID := uint(id)

		// Verificar se usuário existe
		_, err = userRepo.FindByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		// Gerar nova senha aleatória
		newPassword := services.GenerateRandomPassword(8)
		hashedPassword, err := services.HashPassword(newPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar nova senha"})
			return
		}

		// Atualizar senha
		if err := userRepo.ChangePassword(userID, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao redefinir senha"})
			return
		}

		// TODO: Enviar senha por email ou outro canal

		c.JSON(http.StatusOK, gin.H{
			"message":  "Senha redefinida com sucesso",
			"password": newPassword, // Em produção, remover esta linha e enviar por email
		})
	}
}

// SearchUsers busca usuários com filtros (admin)
func SearchUsers(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var searchParams map[string]interface{}
		if err := c.ShouldBindJSON(&searchParams); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Sanitizar parâmetros de busca
		if name, ok := searchParams["name"].(string); ok && name != "" {
			searchParams["name"] = services.SanitizeName(name)
		}

		users, err := userRepo.Search(searchParams)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários"})
			return
		}

		// Remover senhas
		for i := range users {
			users[i].Password = ""
		}

		c.JSON(http.StatusOK, users)
	}
}

// GetUserStatistics retorna estatísticas de usuários (admin)
func GetUserStatistics(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Contar por tipo de perfil
		adminCount, _ := userRepo.CountByProfile("admin")
		studentCount, _ := userRepo.CountByProfile("aluno")
		teacherCount, _ := userRepo.CountByProfile("professor")
		managerCount, _ := userRepo.CountByProfile("gestor")

		// Adicionar outras estatísticas conforme necessário

		c.JSON(http.StatusOK, gin.H{
			"total_users": adminCount + studentCount + teacherCount + managerCount,
			"by_profile": gin.H{
				"admin":   adminCount,
				"student": studentCount,
				"teacher": teacherCount,
				"manager": managerCount,
			},
		})
	}
}

// // internal/api/handlers/student_handlers.go
// package handlers

// import (
// 	"net/http"
// 	"strconv"
// 	"time"

// 	"github.com/devdavidalonso/cecor/internal/repositories"
// 	"github.com/devdavidalonso/cecor/internal/services"
// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// )

// // ListAllStudents lista todos os alunos
// func ListAllStudents(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	repo := repositories.NewStudentRepository(db)

// 	students, err := repo.FindAll()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estudantes"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, students)
// }

// // GetStudentDetails retorna detalhes de um aluno específico
// func GetStudentDetails(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	repo := repositories.NewStudentRepository(db)

// 	idStr := c.Param("id")
// 	idInt, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
// 		return
// 	}
// 	id := uint(idInt)

// 	student, err := repo.FindByID(id)
// 	if err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Aluno não encontrado"})
// 		return
// 	}

// 	// Formatar dados do aluno para exibição
// 	student.User.CPF = services.FormatCPF(student.User.CPF)
// 	student.User.Phone = services.FormatPhone(student.User.Phone)

// 	// Formatar dados dos responsáveis
// 	for i := range student.Guardians {
// 		student.Guardians[i].CPF = services.FormatCPF(student.Guardians[i].CPF)
// 		student.Guardians[i].Phone = services.FormatPhone(student.Guardians[i].Phone)
// 	}

// 	c.JSON(http.StatusOK, student)
// }

// // GetStudentBasicDetails retorna detalhes básicos de um aluno (para professores)
// func GetStudentBasicDetails(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	repo := repositories.NewStudentRepository(db)

// 	idStr := c.Param("id")
// 	idInt, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
// 		return
// 	}
// 	id := uint(idInt)

// 	student, err := repo.FindByID(id)
// 	if err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Aluno não encontrado"})
// 		return
// 	}

// 	// Filtrando informações para acesso limitado de professores
// 	basicStudent := struct {
// 		ID                 uint       `json:"id"`
// 		UserID             uint       `json:"user_id"`
// 		Name               string     `json:"name"`
// 		Email              string     `json:"email"`
// 		BirthDate          *time.Time `json:"birth_date"`
// 		Phone              string     `json:"phone"`
// 		RegistrationNumber string     `json:"registration_number"`
// 		Status             string     `json:"status"`
// 		PhotoURL           string     `json:"photo_url"`
// 		Active             bool       `json:"active"`
// 	}{
// 		ID:                 student.ID,
// 		UserID:             student.UserID,
// 		Name:               student.User.Name,
// 		Email:              student.User.Email,
// 		BirthDate:          student.User.BirthDate,
// 		Phone:              services.FormatPhone(student.User.Phone),
// 		RegistrationNumber: student.RegistrationNumber,
// 		Status:             student.Status,
// 		PhotoURL:           student.User.PhotoURL,
// 		Active:             student.User.Active,
// 	}

// 	c.JSON(http.StatusOK, basicStudent)
// }

// // // CreateStudent cria um novo aluno
// // func CreateStudent(c *gin.Context) {
// // 	db := c.MustGet("db").(*gorm.DB)
// // 	studentRepo := repositories.NewStudentRepository(db)
// // 	userRepo := repositories.NewUserRepository(db)
// // 	auditRepo := repositories.NewAuditRepository(db)

// // 	var input struct {
// // 		Name      string            `json:"name" binding:"required"`
// // 		Email     string            `json:"email" binding:"required,email"`
// // 		Password  string            `json:"password,omitempty"`
// // 		BirthDate time.Time         `json:"birth_date" binding:"required"`
// // 		CPF       string            `json:"cpf" binding:"required"`
// // 		Phone     string            `json:"phone" binding:"required"`
// // 		Address   string            `json:"address" binding:"required"`
// // 		PhotoURL  string            `json:"photo_url"`
// // 		Status    string            `json:"status" binding:"required"`
// // 		Guardians []models.Guardian `json:"guardians"`
// // 	}

// // 	if err := c.ShouldBindJSON(&input); err != nil {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// // 		return
// // 	}

// // 	// Validações dos campos
// // 	if !services.ValidateEmail(input.Email) {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail inválido"})
// // 		return
// // 	}

// // 	if !services.ValidateCPF(input.CPF) {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "CPF inválido"})
// // 		return
// // 	}

// // 	if !services.ValidatePhone(input.Phone) {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "Telefone inválido"})
// // 		return
// // 	}

// // 	// Sanitizar e formatar dados
// // 	input.Name = services.SanitizeName(input.Name)
// // 	input.CPF = services.FormatCPF(input.CPF)
// // 	input.Phone = services.FormatPhone(input.Phone)

// // 	// Criar usuário
// // 	user := models.User{
// // 		Name:      input.Name,
// // 		Email:     input.Email,
// // 		BirthDate: &input.BirthDate,
// // 		CPF:       input.CPF,
// // 		Phone:     input.Phone,
// // 		Address:   input.Address,
// // 		PhotoURL:  input.PhotoURL,
// // 		Profile:   "student",
// // 		Active:    true,
// // 	}

// // 	// Se foi fornecida senha, hashear
// // 	if input.Password != "" {
// // 		hashedPassword, err := services.HashPassword(input.Password)
// // 		if err != nil {
// // 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
// // 			return
// // 		}
// // 		user.Password = hashedPassword
// // 	} else {
// // 		// Gerar senha aleatória
// // 		password := services.GenerateRandomPassword(8)
// // 		hashedPassword, _ := services.HashPassword(password)
// // 		user.Password = hashedPassword

// // 		// TODO: Enviar senha por email ou outro canal
// // 		fmt.Printf("Senha gerada para %s: %s\n", user.Email, password)
// // 	}

// // 	// Salvar usuário
// // 	if err := userRepo.Create(&user); err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário"})
// // 		return
// // 	}

// // 	// Criar registro de aluno
// // 	student := models.Student{
// // 		UserID:             user.ID,
// // 		RegistrationNumber: services.GenerateRegistrationNumber(),
// // 		Status:             input.Status,
// // 	}

// // 	if err := studentRepo.Create(&student); err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar aluno"})
// // 		return
// // 	}

// // 	// Registrar ação de auditoria
// // 	userIDVal, exists := c.Get("userID")
// // 	if !exists {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
// // 		return
// // 	}
// // 	userID := userIDVal.(uint)

// // 	studentJSON, _ := json.Marshal(student)
// // 	auditLog := models.AuditLog{
// // 		EntityType: "student",
// // 		EntityID:   student.ID,
// // 		Action:     "create",
// // 		UserID:     userID,
// // 		NewData:    string(studentJSON),
// // 		CreatedAt:  time.Now(),
// // 	}
// // 	auditRepo.Create(&auditLog)

// // 	// Processar guardiões se fornecidos
// // 	if len(input.Guardians) > 0 {
// // 		guardianRepo := repositories.NewGuardianRepository(db)

// // 		// Limitar a 3 responsáveis
// // 		maxGuardians := 3
// // 		if len(input.Guardians) > maxGuardians {
// // 			input.Guardians = input.Guardians[:maxGuardians]
// // 		}

// // 		for i := range input.Guardians {
// // 			// Validar e formatar dados do responsável
// // 			if input.Guardians[i].CPF != "" && !services.ValidateCPF(input.Guardians[i].CPF) {
// // 				continue // Pular este responsável se o CPF for inválido
// // 			}

// // 			if input.Guardians[i].Phone != "" && !services.ValidatePhone(input.Guardians[i].Phone) {
// // 				continue // Pular este responsável se o telefone for inválido
// // 			}

// // 			// Sanitizar e formatar dados
// // 			input.Guardians[i].Name = services.SanitizeName(input.Guardians[i].Name)
// // 			if input.Guardians[i].CPF != "" {
// // 				input.Guardians[i].CPF = services.FormatCPF(input.Guardians[i].CPF)
// // 			}
// // 			if input.Guardians[i].Phone != "" {
// // 				input.Guardians[i].Phone = services.FormatPhone(input.Guardians[i].Phone)
// // 			}

// // 			input.Guardians[i].StudentID = student.ID
// // 			guardianRepo.Create(&input.Guardians[i])
// // 		}
// // 	}

// // 	// Buscar o estudante completo para retornar
// // 	createdStudent, _ := studentRepo.FindByID(student.ID)

// // 	c.JSON(http.StatusCreated, createdStudent)
// // }

// // // UpdateStudent atualiza um aluno existente
// // func UpdateStudent(c *gin.Context) {
// // 	db := c.MustGet("db").(*gorm.DB)
// // 	studentRepo := repositories.NewStudentRepository(db)
// // 	userRepo := repositories.NewUserRepository(db)
// // 	auditRepo := repositories.NewAuditRepository(db)

// // 	idStr := c.Param("id")
// // 	idInt, err := strconv.Atoi(idStr)
// // 	if err != nil {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
// // 		return
// // 	}
// // 	id := uint(idInt)

// // 	// Verificar se aluno existe
// // 	student, err := studentRepo.FindByID(id)
// // 	if err != nil {
// // 		c.JSON(http.StatusNotFound, gin.H{"error": "Aluno não encontrado"})
// // 		return
// // 	}

// // 	// Obter dados antigos para auditoria
// // 	oldStudentJSON, _ := json.Marshal(student)

// // 	var input struct {
// // 		Name      string     `json:"name"`
// // 		Email     string     `json:"email"`
// // 		BirthDate *time.Time `json:"birth_date"`
// // 		CPF       string     `json:"cpf"`
// // 		Phone     string     `json:"phone"`
// // 		Address   string     `json:"address"`
// // 		PhotoURL  string     `json:"photo_url"`
// // 		Status    string     `json:"status"`
// // 	}

// // 	if err := c.ShouldBindJSON(&input); err != nil {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// // 		return
// // 	}

// // 	// Validar dados se fornecidos
// // 	if input.Email != "" && !services.ValidateEmail(input.Email) {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail inválido"})
// // 		return
// // 	}

// // 	if input.CPF != "" && !services.ValidateCPF(input.CPF) {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "CPF inválido"})
// // 		return
// // 	}

// // 	if input.Phone != "" && !services.ValidatePhone(input.Phone) {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "Telefone inválido"})
// // 		return
// // 	}

// // 	// Atualizar dados do usuário
// // 	user := student.User
// // 	if input.Name != "" {
// // 		user.Name = services.SanitizeName(input.Name)
// // 	}
// // 	if input.Email != "" {
// // 		user.Email = input.Email
// // 	}
// // 	if input.BirthDate != nil {
// // 		user.BirthDate = input.BirthDate
// // 	}
// // 	if input.CPF != "" {
// // 		user.CPF = services.FormatCPF(input.CPF)
// // 	}
// // 	if input.Phone != "" {
// // 		user.Phone = services.FormatPhone(input.Phone)
// // 	}
// // 	if input.Address != "" {
// // 		user.Address = input.Address
// // 	}
// // 	if input.PhotoURL != "" {
// // 		user.PhotoURL = input.PhotoURL
// // 	}

// // 	// Salvar alterações do usuário
// // 	if err := userRepo.Update(&user); err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar usuário"})
// // 		return
// // 	}

// // 	// Atualizar dados do aluno
// // 	if input.Status != "" {
// // 		student.Status = input.Status
// // 	}

// // 	// Salvar alterações do aluno
// // 	if err := studentRepo.Update(student); err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar aluno"})
// // 		return
// // 	}

// // 	// Registrar ação de auditoria
// // 	userIDVal, exists := c.Get("userID")
// // 	if !exists {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
// // 		return
// // 	}
// // 	userID := userIDVal.(uint)

// // 	newStudentJSON, _ := json.Marshal(student)
// // 	auditLog := models.AuditLog{
// // 		EntityType: "student",
// // 		EntityID:   student.ID,
// // 		Action:     "update",
// // 		UserID:     userID,
// // 		OldData:    string(oldStudentJSON),
// // 		NewData:    string(newStudentJSON),
// // 		CreatedAt:  time.Now(),
// // 	}
// // 	auditRepo.Create(&auditLog)

// // 	c.JSON(http.StatusOK, student)
// // }

// // // DeleteStudent desativa um aluno (soft delete)
// // func DeleteStudent(c *gin.Context) {
// // 	db := c.MustGet("db").(*gorm.DB)
// // 	studentRepo := repositories.NewStudentRepository(db)
// // 	userRepo := repositories.NewUserRepository(db)
// // 	auditRepo := repositories.NewAuditRepository(db)

// // 	idStr := c.Param("id")
// // 	idInt, err := strconv.Atoi(idStr)
// // 	if err != nil {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
// // 		return
// // 	}
// // 	id := uint(idInt)

// // 	// Verificar se aluno existe
// // 	student, err := studentRepo.FindByID(id)
// // 	if err != nil {
// // 		c.JSON(http.StatusNotFound, gin.H{"error": "Aluno não encontrado"})
// // 		return
// // 	}

// // 	// Soft delete do aluno
// // 	if err := studentRepo.Delete(id); err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar aluno"})
// // 		return
// // 	}

// // 	// Soft delete do usuário
// // 	if err := userRepo.Delete(student.UserID); err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar usuário associado"})
// // 		return
// // 	}

// // 	// Registrar ação de auditoria
// // 	userIDVal, exists := c.Get("userID")
// // 	if !exists {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID de usuário não encontrado"})
// // 		return
// // 	}
// // 	userID := userIDVal.(uint)

// // 	studentJSON, _ := json.Marshal(student)
// // 	auditLog := models.AuditLog{
// // 		EntityType: "student",
// // 		EntityID:   student.ID,
// // 		Action:     "delete",
// // 		UserID:     userID,
// // 		OldData:    string(studentJSON),
// // 		CreatedAt:  time.Now(),
// // 	}
// // 	auditRepo.Create(&auditLog)

// // 	c.JSON(http.StatusOK, gin.H{"message": "Aluno desativado com sucesso"})
// // }

// // // SearchStudents busca alunos com filtros variados
// // func SearchStudents(c *gin.Context) {
// // 	db := c.MustGet("db").(*gorm.DB)
// // 	repo := repositories.NewStudentRepository(db)

// // 	var searchParams map[string]interface{}
// // 	if err := c.ShouldBindJSON(&searchParams); err != nil {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// // 		return
// // 	}

// // 	// Sanitizar parâmetros de busca
// // 	if name, ok := searchParams["name"].(string); ok && name != "" {
// // 		searchParams["name"] = services.SanitizeName(name)
// // 	}

// // 	students, err := repo.Search(searchParams)
// // 	if err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estudantes"})
// // 		return
// // 	}

// // 	// Formatar dados para exibição
// // 	for i := range students {
// // 		students[i].User.CPF = services.FormatCPF(students[i].User.CPF)
// // 		students[i].User.Phone = services.FormatPhone(students[i].User.Phone)
// // 	}

// // 	c.JSON(http.StatusOK, students)
// // }

// // // ExportStudentResults exporta resultados da busca de alunos
// // func ExportStudentResults(c *gin.Context) {
// // 	db := c.MustGet("db").(*gorm.DB)
// // 	repo := repositories.NewStudentRepository(db)

// // 	var input struct {
// // 		SearchParams map[string]interface{} `json:"search_params"`
// // 		Format       string                 `json:"format" binding:"required,oneof=pdf excel csv"`
// // 	}

// // 	if err := c.ShouldBindJSON(&input); err != nil {
// // 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// // 		return
// // 	}

// // 	// Buscar alunos com os filtros informados
// // 	students, err := repo.Search(input.SearchParams)
// // 	if err != nil {
// // 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estudantes"})
// // 		return
// // 	}

// // 	// Formatar dados para exportação
// // 	for i := range students {
// // 		students[i].User.CPF = services.FormatCPF(students[i].User.CPF)
// // 		students[i].User.Phone = services.FormatPhone(students[i].User.Phone)
// // 	}

// // 	// Gerar arquivo de acordo com o formato solicitado
// // 	switch input.Format {
// // 	case "pdf":
// // 		data, err := services.GenerateStudentsPDF(students)
// // 		if err != nil {
// // 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar PDF"})
// // 			return
// // 		}
// // 		fileName := fmt.Sprintf("alunos_%s.pdf", time.Now().Format("20060102_150405"))
// // 		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
// // 		c.Data(http.StatusOK, "application/pdf", data)

// // 	case "excel":
// // 		data, err := services.GenerateStudentsExcel(students)
// // 		if err != nil {
// // 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar Excel"})
// // 			return
// // 		}
// // 		fileName := fmt.Sprintf("alunos_%s.xlsx", time.Now().Format("20060102_150405"))
// // 		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
// // 		c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", data)

// // 	case "csv":
// // 		data, err := services.GenerateStudentsCSV(students)
// // 		if err != nil {
// // 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar CSV"})
// // 			return
// // 		}
// // 		fileName := fmt.Sprintf("alunos_%s.csv", time.Now().Format("20060102_150405"))
// // 		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
// // 		c.Data(http.StatusOK, "text/csv", data)
// // 	}
// // }

// // ListCourseStudents lista alunos de um curso específico
// func ListCourseStudents(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	repo := repositories.NewStudentRepository(db)

// 	courseIDStr := c.Param("courseId")
// 	courseIDInt, err := strconv.Atoi(courseIDStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
// 		return
// 	}
// 	courseID := uint(courseIDInt)

// 	students, err := repo.FindByCourseID(courseID)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estudantes do curso"})
// 		return
// 	}

// 	// Filtrar informações sensíveis para professores
// 	var basicStudents []struct {
// 		ID                 uint       `json:"id"`
// 		Name               string     `json:"name"`
// 		Email              string     `json:"email"`
// 		Phone              string     `json:"phone"`
// 		BirthDate          *time.Time `json:"birth_date"`
// 		RegistrationNumber string     `json:"registration_number"`
// 		Status             string     `json:"status"`
// 		PhotoURL           string     `json:"photo_url"`
// 	}

// 	for _, student := range students {
// 		basicStudents = append(basicStudents, struct {
// 			ID                 uint       `json:"id"`
// 			Name               string     `json:"name"`
// 			Email              string     `json:"email"`
// 			Phone              string     `json:"phone"`
// 			BirthDate          *time.Time `json:"birth_date"`
// 			RegistrationNumber string     `json:"registration_number"`
// 			Status             string     `json:"status"`
// 			PhotoURL           string     `json:"photo_url"`
// 		}{
// 			ID:                 student.ID,
// 			Name:               student.User.Name,
// 			Email:              student.User.Email,
// 			Phone:              services.FormatPhone(student.User.Phone),
// 			BirthDate:          student.User.BirthDate,
// 			RegistrationNumber: student.RegistrationNumber,
// 			Status:             student.Status,
// 			PhotoURL:           student.User.PhotoURL,
// 		})
// 	}

// 	c.JSON(http.StatusOK, basicStudents)
// }

// // ListStudentGuardians lista os responsáveis de um aluno específico
// func ListStudentGuardians(c *gin.Context) {
// 	db := c.MustGet("db").(*gorm.DB)
// 	guardianRepo := repositories.NewGuardianRepository(db)

// 	studentIDStr := c.Param("id")
// 	studentIDInt, err := strconv.Atoi(studentIDStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de aluno inválido"})
// 		return
// 	}
// 	studentID := uint(studentIDInt)

// 	guardians, err := guardianRepo.FindByStudentID(studentID)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar responsáveis"})
// 		return
// 	}

// 	// Formatar dados para exibição
// 	for i := range guardians {
// 		guardians[i].CPF = services.FormatCPF(guardians[i].CPF)
// 		guardians[i].Phone = services.FormatPhone(guardians[i].Phone)
// 	}

// 	c.JSON(http.StatusOK, guardians)
// }
