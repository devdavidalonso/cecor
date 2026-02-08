// backend/internal/api/handlers/auth_handler.go
package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/auth"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"github.com/devdavidalonso/cecor/backend/internal/service/users"
	"github.com/devdavidalonso/cecor/backend/pkg/errors"
	"golang.org/x/oauth2"
)

const ssoStateCookie = "sso_state"

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

// UserInfo represents the user information returned from the SSO's userinfo endpoint
type UserInfo struct {
	UserID      string `json:"sub"`
	Email       string `json:"email"`
	Name        string `json:"name"`
	RealmAccess struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
}

// AuthHandler implementa os handlers HTTP para autenticação
type AuthHandler struct {
	userService users.Service
	cfg         *config.Config
	ssoConfig   *oauth2.Config
}

// NewAuthHandler cria uma nova instância de AuthHandler
func NewAuthHandler(userService users.Service, cfg *config.Config, ssoConfig *oauth2.Config) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		cfg:         cfg,
		ssoConfig:   ssoConfig,
	}
}

// SSOLogin redirects the user to the SSO provider for authentication.
func (h *AuthHandler) SSOLogin(w http.ResponseWriter, r *http.Request) {
	state, err := generateRandomState()
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, "Failed to generate state for SSO")
		return
	}

	// Store the state in a short-lived cookie
	http.SetCookie(w, &http.Cookie{
		Name:     ssoStateCookie,
		Value:    state,
		Path:     "/",
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
	})

	// Redirect user to consent page to ask for permission
	url := h.ssoConfig.AuthCodeURL(state)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// SSOCallback handles the callback from the SSO provider.
func (h *AuthHandler) SSOCallback(w http.ResponseWriter, r *http.Request) {
	// Check state cookie
	stateCookie, err := r.Cookie(ssoStateCookie)
	if err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "SSO state cookie not found")
		return
	}

	if r.URL.Query().Get("state") != stateCookie.Value {
		errors.RespondWithError(w, http.StatusBadRequest, "Invalid SSO state")
		return
	}

	// Exchange authorization code for a token
	code := r.URL.Query().Get("code")
	fmt.Printf("Attempting to exchange code: %s\n", code)
	token, err := h.ssoConfig.Exchange(context.Background(), code)
	if err != nil {
		fmt.Printf("Error exchanging token: %v\n", err)
		errors.RespondWithError(w, http.StatusInternalServerError, "Failed to exchange token with SSO provider")
		return
	}
	fmt.Printf("Token exchanged successfully. Access Token: %s...\n", token.AccessToken[:10])

	// Use the token to get user info
	userInfo, err := h.getUserInfo(token)
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Extract the best matching role
	var role string
	if len(userInfo.RealmAccess.Roles) > 0 {
		// Simple logic: pick the first relevant role found, or default to user
		// You might want a priority list here if a user has multiple roles
		for _, r := range userInfo.RealmAccess.Roles {
			if r == "Administrador" || r == "admin" || r == "Gestor" || r == "Professor" || r == "Aluno" || r == "Responsável" {
				role = r
				break
			}
		}
	}
	if role == "" {
		role = "user"
	}

	// At this point, you have the user's email from the SSO provider.
	// You can now find or create a user in your local database.
	user, err := h.userService.FindOrCreateByEmail(context.Background(), userInfo.Email, userInfo.Name, role)
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, "Failed to process user information")
		return
	}

	// Generate your application's own JWT
	accessToken, refreshToken, err := auth.GenerateTokens(user, h.cfg)
	if err != nil {
		errors.RespondWithError(w, http.StatusInternalServerError, "Failed to generate application tokens")
		return
	}

	// Redirect to the frontend with the tokens
	redirectURL := fmt.Sprintf("http://localhost:4201/auth/login/success?token=%s&refreshToken=%s", accessToken, refreshToken)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) getUserInfo(token *oauth2.Token) (*UserInfo, error) {
	client := h.ssoConfig.Client(context.Background(), token)
	resp, err := client.Get("http://localhost:8081/realms/lar-sso/protocol/openid-connect/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed to get user info from SSO provider: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("SSO provider returned non-200 status for user info: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read user info response body: %w", err)
	}

	var userInfo UserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	return &userInfo, nil
}

// RefreshToken renova o token de acesso usando um refresh token
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.RespondWithError(w, http.StatusBadRequest, "Formato de dados inválido")
		return
	}

	if req.RefreshToken == "" {
		errors.RespondWithError(w, http.StatusBadRequest, "Refresh token é obrigatório")
		return
	}

	newToken, err := auth.RefreshAccessToken(req.RefreshToken, h.cfg)
	if err != nil {
		errors.RespondWithError(w, http.StatusUnauthorized, "Refresh token inválido ou expirado")
		return
	}

	errors.RespondWithJSON(w, http.StatusOK, map[string]string{
		"token": newToken,
	})
}

func generateRandomState() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
