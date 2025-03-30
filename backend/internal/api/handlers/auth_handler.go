// backend/internal/api/handlers/auth_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/auth"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/usuarios"
	"github.com/devdavidalonso/cecor/backend/pkg/errors"
)

// LoginRequest representa uma requisição de login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshTokenRequest representa uma requisição para renovação de token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken"`
}

// AuthResponse representa a resposta de uma autenticação bem-sucedida
type AuthResponse struct {
	Token        string      `json:"token"`
	RefreshToken string      `json:"refreshToken"`
	User         models.User `json:"user"`
}

// AuthHandler implementa os handlers HTTP para autenticação
type AuthHandler struct {
	usuarioService usuarios.Service
	cfg            *config.Config
}

// NewAuthHandler cria uma nova instância de AuthHandler
func NewAuthHandler(usuarioService usuarios.Service, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		usuarioService: usuarioService,
		cfg:            cfg,
	}
}

// Login autentica um usuário e retorna tokens JWT
// @Summary Login de usuário
// @Description Autentica um usuário e retorna token de acesso e refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Credenciais de login"
// @Success 200 {object} AuthResponse
// @Failure 400 {object} errors.AppError
// @Failure 401 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Validar campos
	if req.Email == "" || req.Password == "" {
		errors.RespondWithError(w, http.StatusBadRequest, "Email e senha são obrigatórios")
		return
	}

	// Autenticar usuário
	user, err := h.usuarioService.Authenticate(r.Context(), req.Email, req.Password)
	if err != nil {
		errors.RespondWithError(w, http.StatusUnauthorized, "Credenciais inválidas")
		return
	}

	// Extrair informações necessárias para o token
	userRoles := make([]string, len(user.Perfis))
	for i, perfil := range user.Perfis {
		userRoles[i] = perfil.TipoPerfil
	}

	// Gerar token de acesso
	token, err := auth.GenerateToken(int64(user.ID), user.Email, user.Nome, userRoles, auth.AccessToken, h.cfg)
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, "Erro ao gerar token")
		return
	}

	// Gerar refresh token
	refreshToken, err := auth.GenerateToken(int64(user.ID), user.Email, user.Nome, userRoles, auth.RefreshToken, h.cfg)
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, "Erro ao gerar refresh token")
		return
	}

	// Atualizar último login do usuário
	now := time.Now()
	user.UltimoLogin = &now
	h.usuarioService.UpdateLastLogin(r.Context(), user.ID)

	// Preparar resposta
	response := AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User: models.User{
			ID:     user.ID,
			Nome:   user.Nome,
			Email:  user.Email,
			Perfil: user.Perfis[0].TipoPerfil, // Usando o perfil principal
		},
	}

	errors.RespondWithJSON(w, http.StatusOK, response)
}

// RefreshToken renova o token de acesso usando um refresh token
// @Summary Renovar token
// @Description Renova o token de acesso usando um refresh token válido
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RefreshTokenRequest true "Refresh token"
// @Success 200 {object} map[string]string
// @Failure 400 {object} errors.AppError
// @Failure 401 {object} errors.AppError
// @Failure 500 {object} errors.AppError
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest

	// Decodificar corpo da requisição
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	// Validar campos
	if req.RefreshToken == "" {
		errors.RespondWithError(w, http.StatusBadRequest, "Refresh token é obrigatório")
		return
	}

	// Renovar token
	newToken, err := auth.RefreshAccessToken(req.RefreshToken, h.cfg)
	if err != nil {
		errors.RespondWithError(w, http.StatusUnauthorized, "Refresh token inválido ou expirado")
		return
	}

	// Responder com novo token
	errors.RespondWithJSON(w, http.StatusOK, map[string]string{
		"token": newToken,
	})
}
