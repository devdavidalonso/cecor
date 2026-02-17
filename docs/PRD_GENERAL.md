# PRD Geral - Sistema de Gestão Educacional CECOR (Product Requirements Document)

**Versão:** 1.0  
**Data:** 17/02/2026  
**Status:** Aprovado (Visão Geral)

---

## 1. Introdução e Visão

O **Sistema de Gestão Educacional CECOR** é uma plataforma integrada para modernizar a administração da ONG. O objetivo é eliminar planilhas descentralizadas, garantir a segurança dos dados dos alunos/voluntários e fornecer inteligência para a tomada de decisões pedagógicas e administrativas.

## 2. Personas e Usuários

1.  **Administrador**: Acesso total, auditoria e configuração do sistema.
2.  **Gestor Pedagógico**: Cria cursos, turmas, aloca salas e valida matrículas.
3.  **Professor/Voluntário**: Registra presença, reporta ocorrências em sala, acessa lista de alunos.
4.  **Aluno/Responsável**: Consulta notas, frequências e recebe comunicados.
5.  **Monitor/Diretoria**: Registra ocorrências de infraestrutura e apoia a operação diária.

## 3. Escopo Funcional Completo (Visão de Futuro)

### 3.1. Núcleo Administrativo

- **Gestão de Pessoas (CRM)**: Cadastro unificado de Alunos, Responsáveis, Professores e Voluntários.
- **Controle de Acesso (RBAC)**: Perfis granulares gerenciados via Keycloak.
- **Auditoria**: Logs detalhados de todas as ações sensíveis (LGPD).

### 3.2. Gestão Acadêmica

- **Cursos e Turmas**: Grade curricular, carga horária e pré-requisitos.
- **Matrículas**: Fluxo de inscrição, lista de espera e cancelamento.
- **Calendário Acadêmico**: Gestão de feriados, recessos e dias letivos.
- **Grade de Aulas (`ClassSessions`)**: Planejamento dia a dia com ementas e alocação de salas (`Location`).

### 3.3. Vida Escolar

- **Frequência e Chamada**: Registro digital de presença pelo professor (Desktop/Mobile).
- **Alertas de Evasão**: Notificação automática para alunos com excesso de faltas.
- **Certificados**: Geração automática de certificados em PDF com validação via QR Code.

### 3.4. Voluntariado e Legal

- **Termos de Voluntariado**: Assinatura digital e gestão de vigência (Lei 9.608/98).
- **Banco de Talentos**: Busca de voluntários por proficiências e formação.

### 3.5. Operacional e Segurança

- **Ocorrências (`Incidents`)**: Registro de problemas disciplinares ou de infraestrutura, com workflow de resolução.
- **Controle de Acesso Físico**: Integração futura com catracas (Opcional).

### 3.6. Comunicação e Engajamento

- **Notificações Multicanal**: Telegram, WhatsApp (API), E-mail e Push.
- **Formulários Dinâmicos (MongoDB)**: Pesquisas de satisfação e entrevistas sociais.

---

## 4. Requisitos Não Funcionais (Geral)

- **Escalabilidade**: Arquitetura de microsserviços para suportar milhares de alunos.
- **Disponibilidade**: 99.5% de uptime durante o horário comercial.
- **Segurança**: Criptografia de dados sensíveis (CPF, Saúde) e conformidade LGPD.
- **Usabilidade**: Interface Mobile-First para professores e alunos.
