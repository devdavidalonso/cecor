# Sistema de Gestão Educacional CECOR

Sistema de gestão educacional para o CECOR (Lar do Alvorecer), projetado para administrar alunos, cursos, matrículas e frequências de forma integrada e segura.

## Status atual (22/02/2026)

1. Homologacao local validada para os perfis `admin`, `professor` e `aluno`.
2. RBAC funcional no frontend e backend para rotas criticas.
3. Listagens de `students` e `teachers` operacionais no painel admin.
4. Seed local implementado para testes repetiveis.
5. Documento oficial de progresso: `docs/STATUS_PROGRESSO_2026-02-22.md`.

## 🚀 Funcionalidades do MVP

O sistema está dividido em módulos funcionais acessíveis conforme o perfil do usuário:

### 🎓 Gestão Acadêmica (Admin)

- **Alunos**: Cadastro completo com dados pessoais, responsáveis e contato.
- **Cursos**: Criação e edição de cursos, definição de carga horária e atribuição de professores.
- **Matrículas**: Inscrição de alunos em cursos com validação de duplicidade.

### 📅 Controle de Frequência (Professor)

- **Chamada Online**: Lista de alunos por turma para registro rápido de presença/falta.
- **Histórico**: Visualização de chamadas anteriores.
- **Cálculo Automático**: Percentual de frequência calculado em tempo real.

### 📊 Relatórios e Análises

- **Relatório por Curso**: Visão geral da turma com totais de aulas e presenças.
- **Relatório por Aluno**: Detalhamento da frequência do aluno em cada disciplina.
- **Exportação PDF**: Geração de documentos oficiais de frequência para impressão.

## 🏗️ Arquitetura

O projeto segue uma arquitetura moderna e escalável:

- **Frontend**: Angular 17 com Material Design (Componentes autônomos, Signals).
- **Backend**: Go (Golang) seguindo Clean Architecture (Hexagonal).
- **Banco de Dados**: PostgreSQL 15.
- **Autenticação**: Keycloak (OIDC/OAuth2) para gestão de identidade e acesso (IAM).

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Docker e Docker Compose instalado.
- Git.
- Acesso à internet (para conectar ao Keycloak remoto).

### Passo a Passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/cecor.git
   cd cecor
   ```

2. **Configure o ambiente:**
   O projeto já vem com configurações padrão para desenvolvimento. Certifique-se de que as portas `4201` (Frontend), `8081` (Backend) e `5433` (PostgreSQL) estejam livres.

3. **Inicie os serviços:**

   ```bash
   docker-compose up -d --build
   ```

4. **Acesse o sistema:**
   - **Frontend**: [http://localhost:4201](http://localhost:4201)
   - **API Backend**: [http://localhost:8081/health](http://localhost:8081/health)

## 👤 Perfis de Acesso (Teste)

O sistema utiliza o Keycloak para autenticação. Utilize as credenciais abaixo para testar os diferentes perfis:

| Perfil            | Usuário       | Senha      | Descrição                                       |
| ----------------- | ------------- | ---------- | ----------------------------------------------- |
| **Administrador** | `admin.cecor` | `admin123` | Acesso total: cria alunos, cursos e matrículas. |
| **Professor**     | `prof.maria`  | `prof123`  | Registra chamadas e visualiza suas turmas.      |
| **Aluno**         | `aluno.pedro` | `aluno123` | Visualiza sua própria frequência.               |

## 🧩 Estrutura do Projeto

```
CECOR/
├── backend/                # API REST em Go
│   ├── cmd/api/            # Entrypoint
│   ├── internal/           # Domínio, Serviços, Repositórios (Core)
│   └── migrations/         # Scripts de banco de dados
├── frontend/               # SPA Angular
│   ├── src/app/core/       # Guardas, Interceptors, Serviços Globais
│   ├── src/app/features/   # Módulos: Alunos, Cursos, Relatórios
│   └── src/app/shared/     # Componentes reutilizáveis
└── docker-compose.yml      # Orquestração dos containers
```

## ❓ Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com Keycloak (CORS/Redirect Loop):**
   - Verifique se o relógio do seu sistema está sincronizado. Tokens JWT dependem de precisão temporal.
   - Limpe o cache do navegador ou teste em aba anônima.

2. **Banco de Dados não conecta:**
   - Verifique se o container `cecor-db` está rodando: `docker ps`.
   - Se alterou configurações de porta, ajuste o `docker-compose.yml` e o `config.yaml` do backend.

3. **Backend não inicia (panic):**
   - Verifique os logs: `docker-compose logs backend`.
   - Geralmente indica falha na conexão com o Banco ou Keycloak indisponível.

## 📄 Licença

Este projeto é desenvolvido para o Lar do Alvorecer (CECOR). Uso restrito.
