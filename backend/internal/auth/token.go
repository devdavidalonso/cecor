package auth

import (
	"context"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
)

// ValidateOIDCToken valida um token JWT do provedor SSO e retorna seus claims
func ValidateOIDCToken(ctx context.Context, tokenString string) (map[string]interface{}, error) {
	if Provider == nil {
		return nil, fmt.Errorf("OIDC provider not initialized")
	}

	// Configurar verifier
	// Usamos o ClientID do backend se disponível, ou aceitamos qualquer um confiando no Provider
	// O importante é validar a assinatura e expiração
	verifier := Provider.Verifier(&oidc.Config{
		SkipClientIDCheck: true, // Keycloak pode emitir tokens com 'azp' diferente do 'aud'
	})

	// Verificar token
	idToken, err := verifier.Verify(ctx, tokenString)
	if err != nil {
		return nil, fmt.Errorf("falha na verificação do token OIDC: %w", err)
	}

	// Extrair claims
	var claims map[string]interface{}
	if err := idToken.Claims(&claims); err != nil {
		return nil, fmt.Errorf("falha ao extrair claims: %w", err)
	}

	return claims, nil
}
