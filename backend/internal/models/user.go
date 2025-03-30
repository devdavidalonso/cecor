package models

// User representa um usuário simplificado para exposição na API
type User struct {
	ID     uint   `json:"id"`
	Nome   string `json:"name"`
	Email  string `json:"email"`
	Perfil string `json:"profile"` // admin, gestor, professor, aluno, responsavel
}
