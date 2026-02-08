import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SsoService {

    constructor(private http: HttpClient) { }

    // No initialization needed for BFF
    async initSso(): Promise<boolean> {
        return true;
    }

    public login() {
        // Redirect to Backend SSO Login
        window.location.href = 'http://localhost:8082/api/v1/auth/sso/login';
    }

    public logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
    }

    public get identityClaims() {
        // Decode token if needed, or just return null for now as we use token directly
        return null;
    }

    public get accessToken() {
        return localStorage.getItem('auth_token');
    }
}
