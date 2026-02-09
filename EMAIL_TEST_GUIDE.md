# Guia de Teste de Email - CECOR

Guia rápido para testar o envio de emails do sistema CECOR.

## 🚀 Teste Rápido (5 minutos) - Mailtrap

**Melhor opção para desenvolvimento - não envia emails reais**

### 1. Criar conta Mailtrap

Acessar: https://mailtrap.io/ e criar conta gratuita

### 2. Copiar credenciais SMTP

No Mailtrap:

- Email Testing → Inboxes → My Inbox
- Copiar: Host, Port, Username, Password

### 3. Configurar `.env`

Editar `backend/.env`:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu_username_aqui
SMTP_PASSWORD=sua_senha_aqui
SMTP_FROM_EMAIL=noreply@cecor.org
SMTP_FROM_NAME=CECOR - Sistema Educacional
FRONTEND_URL=http://localhost:4201
SUPPORT_EMAIL=suporte@cecor.org
```

### 4. Iniciar serviços

```bash
# Terminal 1: PostgreSQL
docker-compose up -d postgres

# Terminal 2: Backend
cd backend
go run cmd/api/main.go
```

### 5. Criar aluno de teste

```bash
curl -X POST http://localhost:8081/api/v1/test/students \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "name": "Teste Email",
      "email": "teste@exemplo.com",
      "cpf": "12345678900",
      "birthDate": "2010-01-01T00:00:00Z",
      "phone": "(11) 99999-9999",
      "address": "Rua Teste, 123",
      "profile": "student",
      "active": true,
      "password": "temp"
    },
    "registrationNumber": "TEST001",
    "status": "active",
    "medicalInfo": "Nenhuma",
    "emergencyContact": "(11) 88888-8888",
    "notes": "Teste de email"
  }'
```

### 6. Verificar email

- Acessar inbox do Mailtrap
- Email deve aparecer em alguns segundos

---

## 📧 Outras Opções de SMTP

### Gmail (Produção)

1. Criar senha de app: https://myaccount.google.com/apppasswords
2. Configurar `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=senha_de_app_sem_espacos
SMTP_FROM_EMAIL=seu-email@gmail.com
SMTP_FROM_NAME=CECOR - Sistema Educacional
```

### Modo Fallback (Sem SMTP)

Deixar campos vazios no `.env`:

```env
SMTP_HOST=
SMTP_PORT=
```

Senha aparecerá nos logs do backend.

---

## ✅ Validação

Após criar aluno, verificar:

### Logs do Backend

```
✅ Email sent successfully to teste@exemplo.com
```

### PostgreSQL

```sql
SELECT u.name, u.email, u.keycloak_user_id
FROM users u
WHERE u.email = 'teste@exemplo.com';
```

### Keycloak

- URL: https://lar-sso-keycloak.hrbsys.tech/admin
- Login: admin / pigu@1025
- Realm: cecor → Users

---

## 🐛 Problemas Comuns

### Email não chega

- Verificar credenciais SMTP no `.env`
- Atualizar página do Mailtrap
- Verificar logs do backend

### Erro "failed to send email"

```bash
# Verificar configuração
cat backend/.env | grep SMTP

# Testar conectividade
telnet smtp.mailtrap.io 2525
```

### Backend não inicia

```bash
# Matar processo na porta 8081
lsof -ti:8081 | xargs kill -9

# Reiniciar
cd backend
go run cmd/api/main.go
```

---

## 📝 Conteúdo do Email

O email enviado contém:

- Saudação personalizada
- Email e senha temporária
- Botão de acesso ao sistema
- Instruções de primeiro login
- Aviso de segurança (troca obrigatória de senha)

---

## 💡 Dicas

**Desenvolvimento:** Use Mailtrap (500 emails/mês grátis)  
**Produção:** Use SendGrid (100 emails/dia grátis) ou Gmail  
**Testes rápidos:** Use modo fallback (senha nos logs)
