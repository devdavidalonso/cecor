# 🌟 Visão Tecnológica e Ecossistema: Lar do Alvorecer Marlene Nobre

**Documento de Visão Estratégica e Arquitetura de Software**
_Destinado ao Time de Desenvolvedores Voluntários e Gestores da ONG Creche Lar do Alvorecer Marlene Nobre._

---

## 1. O Sonho: Um Ecossistema Integrado

O objetivo deste projeto transcende a criação de um simples sistema isolado. A visão é construir um **Ecossistema de Aplicações Integradas** que atenda a todas as frentes de atuação do **Lar do Alvorecer Marlene Nobre**, garantindo que a jornada do assistido seja tratada de forma holística, segura e centralizada.

Uma pessoa atendida pela instituição pode transitar por diversas frentes: ela pode ser mãe de um aluno da creche, paciente da clínica odontológica, beneficiária de cestas básicas e, futuramente, uma voluntária. O sistema deve reconhecer essa pessoa como **única**.

### 1.1. As Frentes de Atuação (Os "Lar-APPs")

- **Lar-SSO (Single Sign-On)**: O coração da segurança. Um painel central (via _Keycloak_) onde todos (assistidos, alunos, médicos, voluntários, professores) fazem login único.
- **Lar-Cadastro Único**: O repositório central de pessoas. Integra dados demográficos e de contato compartilhados entre todas as aplicações.
- **Lar-CECOR**: Gestão acadêmica, ensino profissionalizante para jovens e adultos.
- **Lar-Médic**: Agendamento e prontuário para consultas médicas, odontológicas, psiquiátricas e controle de dispensário/entrega de medicamentos gratuitos.
- **Lar-Assistência Social**: Gestão de necessidades familiares, mapeamento de vulnerabilidade e controle de distribuição de amparo material (ex: cestas básicas).
- **Lar-Clube de Mães**: Gestão de assistência familiar e atividades focadas nas mães da comunidade.

---

## 2. A Escolha Tecnológica (Stack)

A escolha das tecnologias por nossos voluntários foi extremamente assertiva, focando em performace, escalabilidade e baixo custo de nuvem:

- **Frontend**: `Angular 17+` (Padrão corporativo, robusto para grandes aplicações).
- **Backend**: `Go / Golang` (Extremamente rápido, consome o mínimo de recursos/memória, o que reduz custos de servidor drasticamente).
- **Banco de Dados Relacional**: `PostgreSQL` (Confiável, open-source, suportará os dados do CECOR, Médic e do próprio Keycloak em schemas separados).
- **Banco de Dados NoSQL**: `MongoDB` ou `Google Firestore` (Para formulários flexíveis, como o "termômetro de curso" e avaliações).
- **Gestão de Identidade**: `Keycloak` (Padrão ouro para mercado em autenticação e autorização).

---

## 3. Integração com o Google: Parceria e Sustentabilidade

Sendo a ONG uma entidade sem fins lucrativos, temos uma oportunidade de ouro ao ingressar no programa **Google for Nonprofits (Google para Organizações Sem Fins Lucrativos)**.

### 3.1. Google Workspace for Education / Nonprofits

Após a validação da ONG (frequentemente via parceiros como a _TechSoup Brasil_), a instituição ganha acesso **gratuito e ilimitado** a ferramentas cruciais:

- **Google Classroom**: Plataforma completa e gratuita para gerenciar os cursos do CECOR (nossos sistemas farão a matrícula automática dos alunos lá via API sem nenhum custo).
- Contas profissionais de e-mail (`@laralvorecer.org.br`) e espaço no Drive.

### 3.2. Google Cloud Platform (GCP) e Custos

O programa do Google geralmente fornece créditos anuais robustos (cerca de **US$ 2.000 / ano**) para uso em servidores de nuvem. Nossa arquitetura foi pensada para rodar **quase de graça** no GCP:

1.  **Frontend (Angular)**: Hospedado no _Firebase Hosting_. Custo prático zero.
2.  **APIs (Go)**: Hospedadas no _Google Cloud Run_ (Serviço "Serverless"). O servidor "dorme" quando não está em uso e acorda em milissegundos. Possui franquia mensal de 2 milhões de requisições grátis. Custo praticamente zero.
3.  **Banco de Dados**: Um único servidor _Google Cloud SQL (PostgreSQL)_ rodando múltiplos schemas (CECOR, Keycloak, Medic). É o único recurso que fica ligado 24/7.
4.  **Keycloak (SSO)**: Hospedado via _Cloud Run_ ou _Compute Engine_ pequena.

**Conclusão de Custos**: Com a arquitetura proposta (Go + Angular + Serverless), mesmo sem os créditos do programa para ONGs, o custo inicial mensal de todo o ecossistema giraria em torno de _US$ 25 a US$ 40_. **Com a provação no programa "Google for Nonprofits", o custo será efetivamente R$ 0,00 sustentado pelos créditos e isenções anuais.**

---

## 4. O Caminho Adiante

A idade e a senioridade do nosso time de voluntários (40+) não é um desafio, é nossa maior força. Trazemos maturidade de negócio e visão de longo prazo. Não estamos construindo "telas", estamos construindo uma infraestrutura de apoio social escalável.

O próximo passo é consolidar a aprovação da ONG junto ao ecossistema Google, enquanto, paralelamente, continuamos desenvolvendo o Primeiro Pilar deste grande projeto: O cadastro de Turmas e Alunos do **CECOR**.

_Um tijolo de cada vez, construiremos algo que mudará milhares de vidas._
