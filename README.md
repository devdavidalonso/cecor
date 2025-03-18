# CECOR - Sistema de Gestão Educacional

Sistema para gestão de alunos, cursos, matrículas e presenças.

## Requisitos

- Go 1.16+
- MySQL 5.7+
- Node.js 14+ (para o frontend)

## Configuração

1. Clone o repositório:

# Sistema de Gestão Educacional - Documento Técnico Unificado

## 1. Introdução
Este documento descreve o sistema avançado de gestão educacional, projetado para administrar alunos, cursos, matrículas, presenças, relatórios e entrevistas. O sistema adota uma arquitetura de microsserviços, segue princípios de design responsivo e acessível, e implementa múltiplos níveis de segurança para proteção de dados. Destinado a administradores, gestores, professores e alunos, cada perfil de usuário terá acesso a funcionalidades personalizadas e dashboards específicos.

## 2. Arquitetura do Sistema

### 2.1 Visão Geral
O sistema utiliza uma arquitetura de microsserviços, dividindo as funcionalidades em serviços independentes que se comunicam através de uma API Gateway. Essa abordagem possibilita manutenção simplificada, escalabilidade horizontal e resiliência.

### 2.2 Componentes Principais

- API Gateway: Gerencia requisições, autenticação centralizada e balanceamento de carga
- Serviço de Autenticação: Gerencia identidades, controle de acesso e autenticação multi-fator
- Serviço de Alunos: Administra cadastros de alunos e responsáveis
- Serviço de Cursos: Gerencia cursos, aulas e professores
- Serviço de Matrículas: Administra vínculos entre alunos e cursos
- Serviço de Presenças: Controla frequência e gera alertas automáticos
- Serviço de Notificações: Gerencia comunicações por múltiplos canais
- Serviço de Relatórios: Gera análises personalizadas e dashboards
- Serviço de Entrevistas: Administra questionários e suas respostas
- Cache Distribuído: Armazena dados frequentemente acessados para otimização de performance

## 3. Requisitos Funcionais Detalhados

### 3.1 Gestão de Alunos

#### 3.1.1 Cadastro de Alunos

Campos Obrigatórios:

- Nome completo do aluno (campo independente)
- Data de nascimento
- Idade (calculada automaticamente a partir da data de nascimento)
- CPF
- E-mail
- Telefone principal
- Endereço completo (com geolocalização)
- Foto do aluno (com redimensionamento automático)

Campos Opcionais:

- Telefones adicionais (até 2)
- Redes sociais
- Informações médicas relevantes (alergias, medicamentos)
- Necessidades especiais de acessibilidade
- Observação (campo editável por professores e administradores)

Gestão de Responsáveis (até 3 por aluno):

- Nome completo do responsável (campo independente do nome do aluno)
- CPF
- E-mail
- Telefones (até 3, com identificação: pessoal, trabalho, casa)
- Grau de parentesco
- Permissões específicas (buscar aluno, receber notificações, autorizar atividades)

Funcionalidades Avançadas:

- Sistema de upload de documentos digitalizados
- Histórico de alterações cadastrais com auditoria
- Verificação automática de CPF na Receita Federal
- Validação de e-mails e telefones
- Soft delete para exclusões reversíveis
- Registro de notas e observações confidenciais

#### 3.1.2 Pesquisa e Filtros

- Busca avançada com múltiplos critérios combinados
- Filtros dinâmicos por idade, curso, status de matrícula, etc.
- Exportação de resultados em múltiplos formatos (PDF, Excel, CSV)
- Visualizações personalizáveis (tabular, cards, detalhada)

### 3.2 Gestão de Cursos

#### 3.2.1 Cadastro de Cursos

Informações Básicas:

- Nome do curso
- Descrição detalhada e resumida
- Carga horária total
- Número máximo de alunos
- Requisitos prévios
- Nível de dificuldade
- Público-alvo (faixa etária)
- Tags para categorização

Programação:

- Dias da semana (múltipla seleção)
  - Especificação para cursos durante a semana (corte e costura, pintura)
  - Especificação para cursos de fim de semana (jiu-jitsu aos sábados à tarde)
- Horário de início (específico)
- Horário de término (específico)
- Duração (em semanas/meses)
- Calendário com datas especiais e feriados
- Períodos de recesso

Corpo Docente:

- Professor 1 (principal)
- Professor 2
- Professor 3
- Professor 4 
- Professor 5
- Função específica de cada professor
- Gestão de substituições e ausências programadas
- Histórico de professores por turma

Recursos e Materiais:

- Lista de materiais necessários
- Recursos didáticos utilizados
- Repositório digital de materiais por aula
- Agenda de conteúdos programáticos

#### 3.2.2 Funcionalidades Avançadas

- Duplicação de cursos com ajustes
- Histórico de versões de cada curso
- Estatísticas de aproveitamento e frequência
- Sistema de avaliação do curso por alunos e responsáveis
- Integração com sistemas de videoconferência para aulas remotas

### 3.3 Sistema de Matrículas

#### 3.3.1 Processo de Matrícula

- Seleção de aluno com verificação de elegibilidade
- Seleção de curso com checagem de disponibilidade
- Múltiplas datas de entrada e saída por matrícula (para registrar mudanças de curso durante o ano ou participação em cursos diferentes em anos distintos)
- Geração automática de número de matrícula
- Status de matrícula (ativa, em curso, trancada, concluída, cancelada)
- Registro de termos de compromisso digitais

#### 3.3.2 Gestão Avançada

- Histórico completo de matrículas com auditoria de alterações
- Importação em massa de matrículas de anos anteriores
- Transferência entre turmas/cursos com preservação de histórico
- Sistema de lista de espera com priorização configurável
- Cancelamento com registro de motivos e pesquisa de satisfação
- Funcionalidades completas de CRUD (adicionar, editar, excluir e visualizar todas as matrículas)

#### 3.3.3 Certificação

- Tipos de certificados (conclusão, participação, em curso, nenhum)
- Geração automática de certificados digitais com QR code verificável
- Repositório de certificados emitidos
- Integração com blockchain para certificados invioláveis (opcional)
- Métricas de performance para elegibilidade a certificados especiais

### 3.4 Controle de Presença e Frequência

#### 3.4.1 Registro de Presença

- Interface otimizada para dispositivos móveis
- Visualização por curso incluindo:
  - Nome do aluno
  - Idade
  - Data de nascimento
  - Data da matrícula
- Marcação de presença por módulos da aula (integração 9h-10h, profissionalizante 10h-12h)
- Registro de presenças parciais com justificativas
- Código QR para auto-registro supervisionado
- Possibilidade de marcação offline com sincronização posterior
- Organização específica para cursos de cidadania por faixa etária:
  - Crianças: até 12 anos
  - Jovens: 13 a 17 anos
  - Adultos: maior de 18 anos
  - Com exceção para alunos que mudam de idade durante o ano mas preferem permanecer na mesma sala

#### 3.4.2 Monitoramento Avançado

- Dashboard de frequência por aluno, turma e curso
- Alertas automáticos progressivos:
  - 1ª falta: registro interno
  - 2ª falta: notificação ao aluno e responsáveis
  - 3ª falta: alerta de risco de suspensão
  - 4ª falta: aplicação automática de suspensão
- Justificativas de ausência com upload de atestados
- Sistema de compensação de faltas mediante atividades extras

#### 3.4.3 Integrações

- Notificações multi-canal (Telegram, e-mail, SMS, push notification)
- Sistema de lembretes automáticos pré-aula
- Relatórios semanais e mensais de frequência
- Alertas para professores sobre alunos com alto índice de faltas

### 3.5 Sistema de Relatórios e Analytics

#### 3.5.1 Relatórios Operacionais

- Listagens detalhadas e resumidas por diversos critérios
- Relatórios de frequência individuais e coletivos
- Relatórios de desempenho por aluno, turma e curso
- Relatórios de incidentes (faltas, notificações, suspensões)
- Relatórios financeiros (quando aplicável)
- Relatório de conclusão de curso
- Relatório de retorno/confirmação das notificações de falta
- Relatório de faltas acessível também para professores dos cursos

#### 3.5.2 Analytics e Business Intelligence

- Dashboard administrativo com KPIs educacionais
- Análise preditiva de evasão com machine learning
- Visualização de tendências de frequência e participação
- Mapas de calor para identificação de períodos críticos
- Comparativo entre turmas, cursos e períodos

#### 3.5.3 Funcionalidades Avançadas

- Agendamento de relatórios periódicos automatizados
- Exportação em múltiplos formatos (PDF, Excel, CSV, PowerBI)
- Visualizações interativas e gráficos dinâmicos
- Filtros avançados e personalizáveis
- Compartilhamento seguro de relatórios com stakeholders

### 3.6 Sistema de Notificações e Comunicação

#### 3.6.1 Canais de Comunicação

- Telegram (integração com bot personalizado)
- E-mail (templates responsivos)
- SMS (para informações críticas)
- Push notifications (para usuários do aplicativo mobile)
- Notificações in-app (no próprio sistema)

#### 3.6.2 Tipos de Comunicação

- Notificações de faltas (progressivas conforme gravidade, com texto colaborativo a ser desenvolvido)
- Alertas de cancelamento de aulas
- Lembretes de eventos e atividades
- Comunicados institucionais personalizados
- Mensagens diretas entre usuários do sistema

#### 3.6.3 Gestão de Comunicação

- Biblioteca de templates editáveis para cada tipo de comunicação
- Personalização de mensagens com variáveis dinâmicas
- Agendamento de comunicações futuras
- Histórico completo de comunicações por aluno
- Relatórios de entrega e visualização de mensagens
- Configuração de preferências de comunicação por usuário

### 3.7 Sistema de Entrevistas e Formulários

#### 3.7.1 Designer de Formulários

- Criação de questionários personalizados com múltiplos tipos de perguntas
- Suporte a diversos formatos de resposta:
  - Texto livre
  - Múltipla escolha (única ou múltipla seleção)
  - Escala Likert (1-5, 1-10)
  - Matriz de opções
  - Upload de arquivos
  - Data e hora
- Lógica condicional para perguntas dinâmicas
- Validações personalizadas por campo

#### 3.7.2 Gestão de Entrevistas

- Entrevista inicial obrigatória na matrícula
- Entrevistas periódicas de acompanhamento
- Entrevistas de feedback e avaliação de curso
- Agendamento automático baseado em gatilhos do sistema
- Lembretes automáticos para entrevistas pendentes

#### 3.7.3 Análise de Dados

- Relatórios consolidados por formulário
- Análise estatística de respostas
- Comparativo entre períodos e grupos
- Exportação de dados brutos para análise externa
- Identificação de padrões e insights

### 3.8 Termo de Voluntariado Digital

#### 3.8.1 Gestão de Termos

- Editor de modelos de termos com versionamento
- Personalização automática com dados do professor
- Registro de histórico de termos assinados
- Notificações de renovação automatizadas
- Repositório digital de documentos assinados

#### 3.8.2 Processo de Assinatura

- Fluxo de assinatura digital com múltiplas etapas
- Verificação de identidade multi-fator
- Registro de IP, data, hora e dispositivo
- Envio de cópia assinada para e-mail do voluntário
- Validação legal com armazenamento seguro

## 4. Níveis de Acesso e Perfis de Usuário

### 4.1 Perfis Principais

| Ator | Funcionalidades | Permissões | Dashboards |
|------|----------------|------------|------------|
| Administrador | Configuração do sistema, gestão de usuários, relatórios gerenciais, auditoria | Acesso total (CRUD) a todas as funcionalidades | Dashboard executivo com KPIs globais, alertas críticos, auditoria |
| Gestor | Gestão de cursos, matrículas, professores, relatórios, edições cadastrais | Leitura e escrita na maioria das funcionalidades, incluindo edição de matrículas, mudanças de curso, alteração de responsáveis e contatos | Dashboard gerencial com indicadores de matrículas, presença, desempenho por curso |
| Professor | Registro de presenças, acompanhamento de alunos, comunicação, acesso a relatórios de faltas | Leitura e escrita limitada aos seus cursos e alunos, incluindo acesso a relatórios de faltas | Dashboard de turmas, frequência de alunos, calendário de aulas, alertas de alunos em risco |
| Aluno | Visualização de frequência, materiais, certificados | Somente leitura de dados próprios | Dashboard pessoal com presença, próximas aulas, notificações, materiais de estudo |
| Responsável | Acompanhamento do aluno, comunicação | Somente leitura dos dados do aluno vinculado | Dashboard familiar com presença, notificações, comunicados |

### 4.2 Perfis Auxiliares

| Ator | Funcionalidades | Permissões |
|------|----------------|------------|
| Coordenador | Supervisão de cursos e professores | Leitura total e escrita limitada |
| Secretaria | Gestão de matrículas e documentação | Escrita em matrículas e documentos |
| Suporte | Atendimento a usuários | Leitura ampla, escrita limitada |
| Auditor | Revisão de logs e operações | Somente leitura com acesso a logs |

## 5. Eventos e Automações do Sistema

### 5.1 Workflow de Notificações de Faltas

#### 5.1.1 Processo Automático

- Professor registra falta no sistema
- Sistema verifica histórico de faltas do aluno
- Com 2 faltas acumuladas, sistema envia notificação automática
- Com 3 faltas, sistema emite alerta de risco de suspensão
- Com 4 faltas, sistema aplica suspensão e notifica todas as partes

#### 5.1.2 Implementação Técnica

- Serviço de Gatilhos: Monitoramento contínuo de eventos
- Serviço de Templates: Personalização contextual de mensagens (texto a ser colaborativamente desenvolvido)
- Multi-canal: Envio simultâneo por diversos canais configurados
- Confirmação de Entrega: Rastreamento de recebimento e leitura
- Escalação: Aumento de nível de urgência para notificações não visualizadas

### 5.2 Workflow de Matrículas

#### 5.2.1 Processo

- Verificação de dados cadastrais e documentação
- Confirmação de disponibilidade no curso
- Registro de matrícula com termo de compromisso
- Agendamento de entrevista inicial
- Notificação para professor da nova matrícula
- Inclusão na lista de presença e grupos de comunicação

#### 5.2.2 Pontos de Automação

- Verificações automáticas de elegibilidade
- Geração de documentação personalizada
- Agendamento inteligente de entrevistas
- Integração automática com grupos de comunicação

### 5.3 Workflow de Certificação

#### 5.3.1 Processo

- Verificação automática de elegibilidade (frequência mínima, avaliações)
- Geração do certificado digital personalizado
- Assinatura digital por autoridades competentes
- Registro em banco de dados verificável
- Notificação ao aluno sobre disponibilidade
- Opção de impressão física sob demanda

#### 5.3.2 Implementação

- Geração baseada em templates HTML/CSS
- Assinaturas digitais com criptografia
- QR Code para verificação de autenticidade
- API pública para validação por terceiros

## 6. Modelo de Dados Expandido

### 6.1 Esquema Simplificado
O modelo utiliza uma abordagem mista, combinando banco relacional para dados estruturados e NoSQL para dados flexíveis e de alta volumetria.

Entidades Principais (Relacional - MySQL):
- Usuários (usuarios)
- Alunos (alunos)
- Responsáveis (responsaveis)
- Professores (professores)
- Cursos (cursos)
- Matrículas (matriculas)
- Presenças (presencas)
- Certificados (certificados)
- Notificações (notificacoes)

Dados Flexíveis (NoSQL - MongoDB):
- Entrevistas (entrevistas)
- Formulários (formularios)
- Respostas (respostas)
- Logs de Auditoria (audit_logs)
- Documentos Digitalizados (documentos)

### 6.2 Relações Principais

- Um Aluno pode ter múltiplos Responsáveis (1:N)
- Um Aluno pode estar matriculado em múltiplos Cursos (N:M via Matrículas)
- Um Curso pode ter múltiplos Professores (N:M)
- Um Aluno terá múltiplos registros de Presença por Curso (1:N)
- Uma Matrícula pode gerar um ou mais Certificados (1:N)
- Um Usuário pode ter diferentes perfis (Aluno, Professor, Responsável)

### 6.3 Estratégias de Persistência

- Soft Delete: Nenhum dado é realmente excluído, apenas marcado como inativo
- Versionamento: Alterações críticas mantêm registro do estado anterior
- Particionamento: Dados históricos são movidos para partições otimizadas para consulta
- Caching: Dados frequentemente acessados são mantidos em cache distribuído

## 7. Arquitetura Tecnológica

### 7.1 Stack de Tecnologias

#### 7.1.1 Frontend

- Web: React.js com TypeScript
- Mobile: React Native
- UI/UX: Design System próprio baseado em Material Design
- State Management: Redux Toolkit + RTK Query
- Formulários: React Hook Form + Zod
- Autenticação: JWT + HttpOnly Cookies
- Analytics: Google Analytics + Hotjar

#### 7.1.2 Backend

- API Gateway: Kong
- Microsserviços Core: Python (FastAPI)
- Serviços de Processamento: Node.js
- Real-time Communication: Socket.IO
- Task Queue: Celery + Redis
- Serviço de Cache: Redis
- Full-text Search: Elasticsearch

#### 7.1.3 Persistência

- Relacional: MySQL 8 com replicação
- NoSQL: MongoDB para dados flexíveis
- Blob Storage: MinIO para documentos e mídias
- Cache: Redis

#### 7.1.4 DevOps e Infraestrutura

- Containerização: Docker + Kubernetes
- CI/CD: GitHub Actions + ArgoCD
- Monitoramento: Prometheus + Grafana
- Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
- Segurança: Vault para gestão de segredos

### 7.2 Estratégia de Implantação

- Ambientes: Desenvolvimento, Homologação, Produção
- Deployment Strategy: Blue/Green para atualizações sem downtime
- Escalabilidade: Horizontal via Kubernetes
- Backups: Automatizados com verificação de integridade
- Disaster Recovery: Plano documentado com RTO < 1h e RPO < 15min

## 8. Segurança e Conformidade

### 8.1 Estratégias de Segurança

- Autenticação: Multi-fator para contas privilegiadas
- Autorização: RBAC (Role-Based Access Control) granular
- Comunicação: TLS 1.3 para todas as conexões
- Dados Sensíveis: Criptografia em trânsito e em repouso
- Senhas: Hash com bcrypt + salt único por usuário
- Sessões: Curta duração com renovação segura
- API: Proteção contra abusos via rate limiting

### 8.2 Auditoria e Compliance

- Logging: Registro detalhado de todas ações críticas
- Trilha de Auditoria: Imutável e completa para alterações sensíveis
- Retenção de Dados: Políticas claras conforme legislação
- LGPD: Conformidade com Lei Geral de Proteção de Dados
- Exportação de Dados: Mecanismo para sujeitos de dados solicitarem seus dados

## 9. Integrações Externas

### 9.1 Notificações e Comunicação

- Telegram: API Bot para notificações e interações
- E-mail: SMTP seguro com SPF, DKIM e DMARC
- SMS: Integração com gateways multiprovedor
- Push Notifications: Firebase Cloud Messaging

### 9.2 Potenciais Integrações

- Sistemas Acadêmicos: APIs para troca de dados com outros sistemas escolares
- Videoconferência: Zoom/Meet para aulas remotas
- Calendário: iCal/Google Calendar para sincronização de eventos
- Pagamentos: (se aplicável) Gateway de pagamento para mensalidades
- LMS: Integração com plataformas de aprendizado como Moodle

## 10. Roadmap de Implementação

### 10.1 Fase 1: MVP (3 meses)

- Cadastro básico de alunos e cursos
- Sistema de matrículas simplificado
- Controle de presença essencial
- Notificações básicas via Telegram
- Interface administrativa básica

### 10.2 Fase 2: Evolução (3 meses)

- Sistema completo de notificações multi-canal
- Relatórios e dashboards avançados
- Entrevistas e formulários dinâmicos
- App mobile para professores
- Melhorias de UX baseadas em feedback

### 10.3 Fase 3: Consolidação (6 meses)

- Analytics avançado e insights
- Integração com sistemas externos
- Certificação digital com validação
- Funcionalidades de gamificação
- Expansão da arquitetura para alta disponibilidade

## 11. Metodologia de Desenvolvimento

- Abordagem: Ágil (Scrum) com sprints de 2 semanas
- Documentação: Contínua e integrada ao processo de desenvolvimento
- Testes: TDD para backend, componentes testados para frontend
- Qualidade: Code reviews obrigatórios, análise estática, tests de integração
- UX: Testes de usabilidade contínuos com representantes de cada perfil de usuário

## 12. Métricas de Sucesso

- Adoção: % de usuários ativos por perfil
- Engajamento: Frequência e duração de uso
- Eficiência: Redução do tempo em tarefas administrativas
- Satisfação: NPS por perfil de usuário
- Técnicas: Uptime, tempo de resposta, bugs críticos