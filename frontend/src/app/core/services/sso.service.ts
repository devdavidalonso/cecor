import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SsoService {
    private authConfig: AuthConfig = {
        issuer: 'http://localhost:8081/realms/cecor',
        redirectUri: 'http://localhost:4201',
        clientId: 'cecor-frontend',
        responseType: 'code',
        scope: 'openid profile email',
        showDebugInformation: true,
        requireHttps: false, // Allow HTTP for localhost development
        oidc: true // Enable OpenID Connect (required for Public Client with PKCE)
    };

    constructor(
        private oauthService: OAuthService,
        private router: Router
    ) { }

    async initSso(): Promise<boolean> {
        console.log('🔐 [SSO] Iniciando configuração do SSO...');
        this.oauthService.configure(this.authConfig);
        console.log('✅ [SSO] Configuração aplicada:', this.authConfig);
        
        this.oauthService.setupAutomaticSilentRefresh();
        console.log('✅ [SSO] Silent refresh configurado');
        
        try {
            console.log('📡 [SSO] Carregando discovery document...');
            await this.oauthService.loadDiscoveryDocumentAndTryLogin();
            console.log('✅ [SSO] Discovery document carregado e tryLogin executado');
            
            const hasValidToken = this.oauthService.hasValidAccessToken();
            console.log('🔑 [SSO] Token válido?', hasValidToken);
            
            if (hasValidToken) {
                const token = this.oauthService.getAccessToken();
                const claims = this.oauthService.getIdentityClaims();
                console.log('✅ [SSO] Autenticado com sucesso!');
                console.log('  - Access Token:', token ? token.substring(0, 50) + '...' : 'null');
                console.log('  - Claims:', claims);
                return true;
            }
            
            console.warn('⚠️ [SSO] Sem token válido após tryLogin');
            return false;
        } catch (error) {
            console.error('❌ [SSO] Erro ao inicializar SSO:', error);
            return false;
        }
    }

    public login() {
        this.oauthService.initCodeFlow();
    }

    public logout() {
        this.oauthService.logOut();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        this.router.navigate(['/']);
    }

    public get identityClaims(): any {
        return this.oauthService.getIdentityClaims();
    }

    public get accessToken(): string | null {
        return this.oauthService.getAccessToken();
    }

    public get isAuthenticated(): boolean {
        return this.oauthService.hasValidAccessToken();
    }

    public getUserRoles(): string[] {
        const claims: any = this.identityClaims;
        let roles = claims?.realm_access?.roles || [];

        // If no roles in identity claims, try to get them from access token
        if (roles.length === 0 && this.accessToken) {
            try {
                const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
                roles = payload?.realm_access?.roles || [];
            } catch (e) {
                console.warn('⚠️ [SSO] Erro ao decodificar Access Token para obter roles:', e);
            }
        }
        
        return roles;
    }

    public getUserName(): string {
        const claims: any = this.identityClaims;
        return claims?.name || claims?.preferred_username || '';
    }

    public getUserEmail(): string {
        const claims: any = this.identityClaims;
        return claims?.email || '';
    }
}

