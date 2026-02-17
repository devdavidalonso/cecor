# SPEC Técnica Geral - Arquitetura de Referência CECOR

**Versão:** 1.0  
**Arquitetura Alvo**: Microsserviços e Event-Driven

---

## 1. Visão Arquitetural

A arquitetura final do CECOR é baseada em microsserviços desacoplados, permitindo escalabilidade independente dos módulos de Alunos, Acadêmico e Comunicação.

### Diagrama Conceitual

```mermaid
graph TD
    ClientApp[Frontend Angular PWA] --> API_Gateway[Nginx / API Gateway]

    API_Gateway --> Auth[Keycloak Identity Provider]
    API_Gateway --> BFF[Backend for Frontend (Go)]

    subgraph "Core Services (Go)"
        BFF --> SvcStudent[Student Service]
        BFF --> SvcAcademic[Academic Service]
        BFF --> SvcReport[Reporting Service]
    end

    subgraph "Support Services"
        SvcComm[Notification Service]
        SvcForms[Forms Engine (Mongo)]
    end

    SvcStudent --> DB_Postgres[(PostgreSQL - Core)]
    SvcAcademic --> DB_Postgres
    SvcForms --> DB_Mongo[(MongoDB - Flexible)]

    BFF -->  MessageBroker{RabbitMQ / Kafka}
    MessageBroker --> SvcComm
```

## 2. Stack Tecnológico (Full)

- **Frontend**: Angular 17+ (Material Design, PWA).
- **Backend**: Go 1.22+ (Clean Architecture).
- **Banco de Dados Relacional**: PostgreSQL 15+ (Dados estruturados, 3NF).
- **Banco de Dados NoSQL**: MongoDB 7+ (Formulários dinâmicos, Logs de Auditoria JSON).
- **Cache**: Redis (Sessões, Cache de busca).
- **Mensageria**: RabbitMQ (Processamento assíncrono de notificações e certificados).
- **Autenticação**: Keycloak (OIDC/OAuth2).
- **Infraestrutura**: Kubernetes (K8s) ou Google Cloud Run.

## 3. Padrões Técnicos

- **API**: RESTful (Json) para comunicação síncrona.
- **Observabilidade**: OpenTelemetry + Grafana/Prometheus.
- **CI/CD**: GitHub Actions com pipelines de teste e deploy automatizado.
- **Segurança**: mTLS entre serviços, gestão de secrets via Vault.

## 4. Estratégia de Dados

- **Sharding**: Separação física de schemas por serviço (ex: `schema_students`, `schema_academic`).
- **Data Lake**: Exportação de dados para BigQuery para Analytics (Futuro).
