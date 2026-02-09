# Teste Completo - Dia 7 + Dia 8 pelo Frontend

Guia para testar a integração completa: Frontend → Backend → Keycloak → Email

---

## 🚀 Passo a Passo

### 1. Configurar Email (Opcional)

**Opção A: Com Mailtrap (Recomendado)**

Editar `backend/.env`:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu_username
SMTP_PASSWORD=sua_senha
```

**Opção B: Modo Fallback (Sem email)**

Deixar vazio no `backend/.env`:

```env
SMTP_HOST=
SMTP_PORT=
```

---

### 2. Iniciar Serviços

**Terminal 1: PostgreSQL**

```bash
cd /home/david-alonso/Projetos/cecor
docker-compose up -d postgres
```

**Terminal 2: Backend**

```bash
cd /home/david-alonso/Projetos/cecor/backend
go run cmd/api/main.go
```

Aguarde ver:

```
Server starting on port 8081
```

**Terminal 3: Frontend**

```bash
cd /home/david-alonso/Projetos/cecor/frontend
npm start
```

Aguarde ver:

```
✔ Browser application bundle generation complete.
```

---

### 3. Acessar Frontend

1. Abrir navegador: **http://localhost:4201**
2. Fazer login com usuário admin
3. Navegar para: **Alunos** (ou `/students`)

---

### 4. Criar Novo Aluno

**4.1. Clicar em "Novo Aluno"**

**4.2. Preencher Formulário:**

**Dados Pessoais:**

- Nome: `Maria Silva Santos`
- CPF: `12345678900` (será formatado automaticamente)
- Data de Nascimento: `2010-05-15`
- Email: `maria.silva@teste.com`
- Telefone: `11999998888` (será formatado como `(11) 99999-8888`)
- Endereço: `Rua das Flores, 123 - São Paulo, SP`

**Dados do Aluno:**

- Número de Matrícula: `2024001`
- Status: `Ativo`
- Contato de Emergência: `José Silva - (11) 98888-7777`
- Informações Médicas: `Nenhuma alergia conhecida`
- Observações: `Teste de integração Dia 7 + 8`

**4.3. Clicar em "Criar Aluno"**

---

### 5. Validações Esperadas

#### ✅ Frontend

- Formulário valida campos obrigatórios
- CPF e telefone são formatados automaticamente
- Mensagem de sucesso ao criar
- Redirecionamento para lista de alunos
- Novo aluno aparece na tabela

#### ✅ Backend (Logs)

```
Creating user in Keycloak...
✅ User created in Keycloak: [keycloak-user-id]
✅ Role 'aluno' assigned
✅ Temporary password set
```

**Com SMTP configurado:**

```
✅ Email sent successfully to maria.silva@teste.com
```

**Sem SMTP (Fallback):**

```
Email service not configured. Temporary password: Xy9#aB2$cD4!
```

#### ✅ PostgreSQL

```sql
-- Verificar no banco
SELECT u.id, u.name, u.email, u.keycloak_user_id, s.registration_number
FROM users u
JOIN students s ON s.user_id = u.id
WHERE u.email = 'maria.silva@teste.com';
```

**Resultado esperado:**

```
id | name              | email                    | keycloak_user_id      | registration_number
1  | Maria Silva Santos| maria.silva@teste.com    | abc-123-def-456       | 2024001
```

#### ✅ Keycloak

1. Acessar: https://lar-sso-keycloak.hrbsys.tech/admin
2. Login: `admin` / `pigu@1025`
3. Realm: `cecor`
4. Users → Buscar: `maria.silva@teste.com`

**Verificar:**

- ✅ Usuário existe
- ✅ Email: `maria.silva@teste.com`
- ✅ Enabled: `true`
- ✅ Role Mappings → Realm Roles: `aluno`
- ✅ Required Actions: `UPDATE_PASSWORD`

#### ✅ Email (se SMTP configurado)

**Mailtrap:**

- Acessar inbox
- Email recebido com assunto: "Bem-vindo ao CECOR"
- Contém: Email e senha temporária

---

### 6. Testar Outras Funcionalidades

#### 6.1. Visualizar Aluno

1. Na lista, clicar no ícone 👁️ (olho)
2. Verificar todos os dados
3. Navegar pelas tabs (Dados, Responsáveis, Documentos)

#### 6.2. Editar Aluno

1. Clicar no ícone ✏️ (lápis)
2. Modificar telefone: `(11) 97777-6666`
3. Salvar
4. Verificar atualização na lista

#### 6.3. Filtrar Alunos

1. Voltar para lista
2. Filtrar por nome: `Maria`
3. Filtrar por status: `Ativo`
4. Limpar filtros

#### 6.4. Excluir Aluno (Cuidado!)

1. Clicar no ícone 🗑️ (lixeira)
2. Confirmar exclusão
3. Verificar remoção da lista

---

### 7. Testar Login com Credenciais do Aluno

**7.1. Fazer Logout**

**7.2. Tentar Login:**

- Email: `maria.silva@teste.com`
- Senha: `[senha temporária do email ou logs]`

**7.3. Keycloak deve:**

- ✅ Aceitar login
- ✅ Forçar troca de senha (UPDATE_PASSWORD)
- ✅ Redirecionar após troca

---

## 🐛 Troubleshooting

### Frontend não carrega

```bash
# Verificar se porta 4201 está livre
lsof -ti:4201 | xargs kill -9

# Reinstalar dependências
cd frontend
npm install
npm start
```

### Backend não inicia

```bash
# Verificar se porta 8081 está livre
lsof -ti:8081 | xargs kill -9

# Reiniciar
cd backend
go run cmd/api/main.go
```

### Erro ao criar aluno

**Erro 401 Unauthorized:**

- Verificar se está logado
- Verificar token JWT no localStorage

**Erro 500 Internal Server Error:**

- Verificar logs do backend
- Verificar conexão com Keycloak
- Verificar PostgreSQL rodando

### Email não chega

**Mailtrap:**

- Verificar credenciais no `.env`
- Atualizar página da inbox

**Fallback:**

- Verificar logs do backend para senha temporária

### Keycloak não cria usuário

- Verificar credenciais admin no `.env`
- Testar acesso: https://lar-sso-keycloak.hrbsys.tech/admin
- Verificar realm `cecor` existe

---

## ✅ Checklist de Validação Final

### Frontend (Dia 8)

- [ ] Lista de alunos carrega
- [ ] Filtros funcionam
- [ ] Formulário valida campos
- [ ] Máscaras de CPF/telefone funcionam
- [ ] Criação de aluno funciona
- [ ] Edição de aluno funciona
- [ ] Exclusão de aluno funciona (com confirmação)
- [ ] Detalhes do aluno exibem corretamente

### Backend (Dia 7)

- [ ] API `/students` responde
- [ ] Criação salva no PostgreSQL
- [ ] Usuário criado no Keycloak
- [ ] Role "aluno" atribuída
- [ ] Email enviado (ou senha logada)
- [ ] Keycloak user ID salvo no banco

### Integração Completa

- [ ] Frontend → Backend comunicação OK
- [ ] Backend → PostgreSQL persistência OK
- [ ] Backend → Keycloak integração OK
- [ ] Backend → SMTP envio OK (se configurado)
- [ ] Login com credenciais do aluno funciona
- [ ] Keycloak força troca de senha

---

## 📊 Fluxo Completo

```
Frontend (Angular)
    ↓ POST /api/v1/students
Backend (Go)
    ↓ 1. Salva no PostgreSQL
    ↓ 2. Cria usuário no Keycloak
    ↓ 3. Atribui role "aluno"
    ↓ 4. Define senha temporária
    ↓ 5. Envia email (ou loga senha)
    ↓ 6. Atualiza keycloak_user_id
    ↓ 7. Retorna sucesso
Frontend
    ↓ Redireciona para lista
    ↓ Exibe aluno criado
```

---

## 🎉 Sucesso!

Se todos os passos funcionaram:

- ✅ Dia 7 (Backend) está funcionando perfeitamente
- ✅ Dia 8 (Frontend) está funcionando perfeitamente
- ✅ Integração completa está OK
- ✅ Sistema pronto para produção!

---

## 📝 Próximos Passos

1. Adicionar link "Alunos" no menu/sidebar
2. Implementar permissões (apenas admin cria/edita)
3. Adicionar paginação na lista
4. Implementar busca avançada
5. Adicionar upload de foto
6. Implementar gestão de responsáveis
7. Implementar gestão de documentos
