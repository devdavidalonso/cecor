package auth

import (
	"context"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/devdavidalonso/cecor/backend/internal/config"
	"golang.org/x/oauth2"
)

var Provider *oidc.Provider

// InitProvider initializes the OIDC provider
func InitProvider(ctx context.Context, issuerURL string) error {
	var err error
	Provider, err = oidc.NewProvider(ctx, issuerURL)
	if err != nil {
		return fmt.Errorf("failed to query provider %q: %v", issuerURL, err)
	}
	return nil
}

// NewSSOConfig creates a new OAuth2 configuration for the SSO provider.
func NewSSOConfig(cfg *config.Config) *oauth2.Config {
	if Provider == nil {
		// Fallback or error if provider not initialized.
		// For now, we assume InitProvider is called before.
		// If not, we could try to init here but we need context.
		return &oauth2.Config{
			ClientID:     cfg.SSO.ClientID,
			ClientSecret: cfg.SSO.ClientSecret,
			RedirectURL:  cfg.SSO.RedirectURL,
			Endpoint: oauth2.Endpoint{
				AuthURL:  cfg.SSO.AuthURL,
				TokenURL: cfg.SSO.TokenURL,
			},
			Scopes: []string{oidc.ScopeOpenID, "profile", "email"},
		}
	}

	return &oauth2.Config{
		ClientID:     cfg.SSO.ClientID,
		ClientSecret: cfg.SSO.ClientSecret,
		RedirectURL:  cfg.SSO.RedirectURL,
		Endpoint: oauth2.Endpoint{
			AuthURL:  cfg.SSO.AuthURL,
			TokenURL: cfg.SSO.TokenURL,
		},
		Scopes: []string{oidc.ScopeOpenID, "profile", "email"},
	}
}
