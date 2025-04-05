// backend/internal/auth/types.go
package auth

// UserClaims stores user information from JWT tokens
type UserClaims struct {
	UserID int64    `json:"userId"`
	Name   string   `json:"name"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
}
