# 🔐 INTEGRATION GUIDE - Keycloak + CECOR

**Objetivo:** Integrar o sistema CECOR com autenticação centralizada via Keycloak (lar-sso)

---

## 📋 PRÉ-REQUISITOS

- ✅ Acesso à Internet (para conectar ao Keycloak de produção)
- ✅ Docker e Docker Compose instalados
- ✅ Go 1.22+ instalado
- ✅ Node.js 18+ e npm instalados

---

## 🎯 VISÃO GERAL DA INTEGRAÇÃO

```
Usuário → Frontend (Angular) → Keycloak Remoto (Login)
                ↓                      ↓
            Token JWT              Token JWT
                ↓                      ↓
         Backend (Go) ← Valida Token ←┘
                ↓
          PostgreSQL
```

---

## 🔧 PARTE 1 - CONFIGURAÇÃO DO KEYCLOAK (PRODUÇÃO)

O ambiente local agora utiliza o Keycloak de produção hospedado em:
**`https://lar-sso-keycloak.hrbsys.tech`**

**Realm:** `cecor`

### 1.1 - Acesso e Credenciais

Caso necessite acessar o console administrativo (somente administradores):

1. Abra: https://lar-sso-keycloak.hrbsys.tech/admin
2. Utilize suas credenciais de administrador.

### 1.2 - Configuração dos Clients (Já configurados)

O sistema utiliza dois clients principais:

#### cecor-frontend (Public)

- **Client ID:** `cecor-frontend`
- **Root URL:** `http://localhost:4201`
- **Valid redirect URIs:** `http://localhost:4201/*`
- **Web origins:** `*`

#### cecor-backend (Confidential)

- **Client ID:** `cecor-backend`
- **Access Type:** Confidential
- **Service Accounts Enabled:** ON
- **Valid redirect URIs:** `http://localhost:8081/*`

### 1.3 - Roles do Sistema

- `administrador`: Gestão completa
- `professor`: Registro de frequência
- `aluno`: Visualização de dados próprios

### 1.4 - Usuários de Teste

| Perfil    | Usuário       | Senha      |
| --------- | ------------- | ---------- |
| Admin     | `admin.cecor` | `admin123` |
| Professor | `prof.maria`  | `prof123`  |
| Aluno     | `aluno.pedro` | `aluno123` |

---

## 🔧 PARTE 2 - CONFIGURAÇÃO DO BACKEND (GO)

### 2.1 - Portas e Serviços

No `docker-compose.yml`, o backend é exposto na porta **8081**.

```yaml
backend:
  ports:
    - "8081:8080"
```

### 2.2 - Variáveis de Ambiente (.env.docker)

O backend se conecta ao Keycloak via HTTPS.

```env
# Keycloak Configuration - Production
SSO_CLIENT_ID=cecor-backend
SSO_CLIENT_SECRET=OEnuzW2z4a5vANRz8U6gYn09wGWnXFuUq
SSO_AUTH_URL=https://lar-sso-keycloak.hrbsys.tech/realms/cecor/protocol/openid-connect/auth
SSO_TOKEN_URL=https://lar-sso-keycloak.hrbsys.tech/realms/cecor/protocol/openid-connect/token
SSO_USER_INFO_URL=https://lar-sso-keycloak.hrbsys.tech/realms/cecor/protocol/openid-connect/userinfo
```

### 2.3 - Testar Endpoint de Verificação

Para verificar se o token é válido:

```bash
curl -v -H "Authorization: Bearer <SEU_TOKEN>" http://localhost:8081/api/v1/auth/verify
```

---

## 🔧 PARTE 3 - CONFIGURAÇÃO DO FRONTEND (ANGULAR)

### 3.1 - Portas

No `docker-compose.yml`, o frontend é exposto na porta **4201**.

```yaml
frontend:
  ports:
    - "4201:80"
```

### 3.2 - Configuração do Keycloak Service

Ao configurar o `keycloak-angular`, utilize a URL de produção:

```typescript
keycloak.init({
  config: {
    url: "https://lar-sso-keycloak.hrbsys.tech", // URL de Produção
    realm: "cecor",
    clientId: "cecor-frontend",
  },
  initOptions: {
    onLoad: "check-sso",
    checkLoginIframe: false,
  },
  enableBearerInterceptor: true,
  bearerPrefix: "Bearer",
});
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Failed to connect to Keycloak"

**Causa:** Backend sem acesso à internet ou DNS bloqueado no container.
**Solução:** Verifique a conexão de internet. O backend conecta direto na URL pública `https://lar-sso-keycloak.hrbsys.tech`.

### Erro: "CORS error" no Frontend

**Causa:** Web Origins do Keycloak não inclui `http://localhost:4201`.
**Solução:** Adicione `http://localhost:4201` (ou `*` para dev) nas Web Origins do client `cecor-frontend`.

### Erro: "Invalid parameter: redirect_uri"

**Causa:** A URL que você está acessando no navegador não bate com a "Valid Redirect URIs" no Keycloak.
**Solução:** Certifique-se de acessar `http://localhost:4201` e que essa URL esteja cadastrada no Keycloak.

---

## ✅ CHECKLIST DE VALIDAÇÃO (ATUALIZADO)

- [x] Backend rodando na porta 8081 (`http://localhost:8081/health`)
- [x] Frontend rodando na porta 4201 (`http://localhost:4201`)
- [x] Backend conecta ao Keycloak de produção
- [x] Usuários de teste criados no Keycloak remoto
- [ ] Login no Frontend redireciona para URL `lar-sso-keycloak.hrbsys.tech`
- [ ] Backend valida tokens assinados por `lar-sso-keycloak.hrbsys.tech`
