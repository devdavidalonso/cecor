# DEV Runbook (Hibrido)

Objetivo: desenvolver rapido com aplicacao local e dependencias em Docker.

## Arquitetura local
1. `frontend` local (`npm start`) em `http://localhost:4201`
2. `backend` local (`go run`) em `http://localhost:8082`
3. Infra Docker:
   - PostgreSQL: `localhost:5433`
   - MongoDB: `localhost:27017`
   - Redis: `localhost:6379`
   - RabbitMQ: `localhost:5672` (UI `http://localhost:15672`)
4. Keycloak local: projeto `lar-sso` em `http://localhost:8081`

## Subir ambiente (3 terminais)
1. Keycloak:
```bash
cd /home/david-alonso/Projetos/lar-sso && docker compose up -d
```

2. Infra CECOR:
```bash
cd /home/david-alonso/Projetos/cecor && make dev-infra-up
```

3. Backend local:
```bash
cd /home/david-alonso/Projetos/cecor && make dev-backend
```

4. Frontend local:
```bash
cd /home/david-alonso/Projetos/cecor && make dev-frontend
```

## Testes rapidos
```bash
cd /home/david-alonso/Projetos/cecor
./scripts/quick_api_test.sh
./scripts/smoke_rbac_keycloak.sh
```

## Seed local (dados para frontend)
```bash
cd /home/david-alonso/Projetos/cecor
make dev-seed
```

Resultado esperado apos seed:
1. Lista de professores com dados em `/teachers`.
2. Lista de alunos com dados em `/students`.

## Derrubar ambiente
```bash
cd /home/david-alonso/Projetos/cecor && make dev-infra-down
cd /home/david-alonso/Projetos/lar-sso && docker compose down
```

## Observacoes
1. Em desenvolvimento local, use `.env` local (nao versionado).
2. Para staging/producao, use apenas variaveis/segredos do ambiente (sem `.env` no git).
3. No modo hibrido, ajuste `MONGO_URI` no `backend/.env` para localhost:
```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/cecor?authSource=admin
```

## Validacao minima (GO local)
1. `make dev-infra-status` mostra `postgres`, `mongodb`, `redis`, `rabbitmq` como `Up`.
2. Login com `prof.maria` funciona.
3. Acesso direto de professor para `http://localhost:4201/students` retorna `acesso-negado` (sem listar alunos).
4. Em admin, `students` e `teachers` carregam com `200` no Network.
5. Sem erro funcional de icone PWA (`icon-144x144.png`).
