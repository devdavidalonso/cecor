---
name: cecor-management
description: Guia de gerenciamento de Alunos e Integração Keycloak no projeto CECOR
---

# CECOR Management Skill

Esta skill descreve os padrões e procedimentos para gerenciar alunos, professores e a integração com o Keycloak no projeto CECOR.

## 1. Arquitetura de Alunos

Os alunos são compostos por duas entidades principais no banco de dados:

- **Table `users`**: Contém dados básicos (nome, email, cpf, senha).
- **Table `students`**: Contém dados acadêmicos (matrícula, status, notas).
- **Table `addresses`**: Vinculada ao `user_id`, contém o endereço estruturado.

### Padrão de Endereço

Sempre use a tabela `addresses`. Não adicione campos de endereço diretamente na tabela `users` ou `students`.

## 2. Integração Keycloak

O sistema utiliza um Keycloak externo (`lar-sso`).

### Fluxo de Criação:

1. O backend cria o usuário localmente.
2. O `KeycloakService` cria o usuário no Keycloak usando a Admin API.
3. O `KeycloakUserID` retornado é salvo no banco local.

### Configuração Crítica:

- **KeycloakUserID**: Deve ser um ponteiro (`*string`) no Go para permitir valores `NULL` no banco caso a integração falhe, garantindo resiliência.
- **Ambiente**: As credenciais Admin (`KEYCLOAK_ADMIN_USERNAME`, etc.) devem estar presentes no `.env.docker`.

## 3. Comandos Úteis

- **Reiniciar serviços**: `make restart`
- **Verificar Logs**: `docker logs cecor-backend`
- **Testar Keycloak via Curl**:
  ```bash
  curl -d "client_id=admin-cli" -d "username=admin" -d "password=SENHA" -d "grant_type=password" https://lar-sso-keycloak.hrbsys.tech/realms/master/protocol/openid-connect/token
  ```

## 4. Padrões de Frontend (Angular)

- Use **Material Stepper** para formulários de cadastro.
- Use **FormArray** para gerenciar múltiplos responsáveis (Guardians).
- Datas devem ser enviadas no formato ISO (`YYYY-MM-DD`).
