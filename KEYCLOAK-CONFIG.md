# Keycloak Configuration - CECOR

## Realm Information

- **Realm name:** cecor
- **Keycloak URL:** https://lar-sso-keycloak.hrbsys.tech

## Clients

### cecor-frontend (Public)

- **Client ID:** cecor-frontend
- **Client type:** OpenID Connect
- **Client authentication:** OFF
- **Root URL:** http://localhost:4201
- **Valid redirect URIs:** http://localhost:4201/\*
- **Web origins:** http://localhost:4201

### cecor-backend (Confidential)

- **Client ID:** cecor-backend
- **Client type:** OpenID Connect
- **Client authentication:** ON
- **Client Secret:** OEnuzW2z4a5vANRz8U6gYn09wGWnXFuUq
- **Root URL:** http://localhost:8081
- **Valid redirect URIs:** http://localhost:8081/\*

## Realm Roles

- **administrador** - Administrador do sistema CECOR
- **professor** - Professor que registra frequência
- **aluno** - Aluno que visualiza frequência

## Test Users

### Admin

- **Username:** admin.cecor
- **Password:** admin123
- **Email:** admin@cecor.test
- **Role:** administrador

### Professor

- **Username:** prof.maria
- **Password:** prof123
- **Email:** maria@cecor.test
- **Role:** professor

### Aluno

- **Username:** aluno.pedro
- **Password:** aluno123
- **Email:** pedro@cecor.test
- **Role:** aluno

## Next Steps

- Dia 3: Integrar backend Go com Keycloak
- Dia 4: Integrar frontend Angular com Keycloak
- Dia 5: Testar fluxo completo de autenticação
