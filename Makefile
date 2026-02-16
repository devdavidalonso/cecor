# ===================================
# CECOR - Makefile Profissional
# ===================================

COMPOSE=docker compose
COMPOSE_STAGING=docker compose -f docker-compose.staging.yml
BACKEND_DIR=backend
FRONTEND_DIR=frontend

.PHONY: help up up-staging down down-staging logs logs-staging backend frontend format clean restart restart-staging status

help:
	@echo "======================================="
	@echo "PRODUÇÃO (Keycloak externo):"
	@echo " make up           -> Sobe tudo (Docker)"
	@echo " make up-backend   -> Sobe backend + banco"
	@echo " make up-db        -> Sobe apenas o banco de dados"
	@echo " make down         -> Derruba ambiente"
	@echo " make restart      -> Reinicia ambiente"
	@echo ""
	@echo "STAGING (Keycloak local lar-sso):"
	@echo " make up-staging      -> Sobe CECOR usando Keycloak do lar-sso"
	@echo " make down-staging    -> Derruba CECOR staging"
	@echo " make restart-staging -> Reinicia CECOR staging"
	@echo " make logs-staging    -> Logs do staging"
	@echo ""
	@echo "LOCAL (sem Docker):"
	@echo " make backend      -> Roda backend local (binário)"
	@echo " make frontend     -> Roda frontend local (binário)"
	@echo ""
	@echo "OUTROS:"
	@echo " make logs         -> Logs em tempo real (produção)"
	@echo " make logs-backend -> Logs apenas do backend"
	@echo " make logs-db      -> Logs apenas do banco"
	@echo " make format       -> Formata código"
	@echo " make clean        -> Limpa docker"
	@echo " make status       -> Status dos containers"
	@echo "======================================="
	@echo ""
	@echo "URLs STAGING:"
	@echo "  CECOR Frontend: http://localhost:4201"
	@echo "  CECOR Backend:  http://localhost:8081"
	@echo "  Keycloak:       http://localhost:8081 (do lar-sso)"
	@echo "======================================="

up:
	$(COMPOSE) up --build -d

up-backend:
	$(COMPOSE) up --build -d backend

up-db:
	$(COMPOSE) up -d postgres

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-db:
	$(COMPOSE) logs -f postgres

backend:
	cd $(BACKEND_DIR) && go run cmd/api/main.go

frontend:
	cd $(FRONTEND_DIR) && npm start

format:
	cd $(BACKEND_DIR) && gofmt -w .
	cd $(FRONTEND_DIR) && npm run format

# --- Staging Commands (usa Keycloak do lar-sso) ---

up-staging:
	@echo "Subindo CECOR em modo STAGING (usando Keycloak do lar-sso)..."
	@echo "Certifique-se de que o lar-sso está rodando: cd ../lar-sso && make up"
	$(COMPOSE_STAGING) up --build -d

down-staging:
	$(COMPOSE_STAGING) down

restart-staging: down-staging up-staging

logs-staging:
	$(COMPOSE_STAGING) logs -f

status:
	@echo "=== Containers de Produção ==="
	$(COMPOSE) ps
	@echo ""
	@echo "=== Containers de Staging ==="
	$(COMPOSE_STAGING) ps 2>/dev/null || echo "Staging não está rodando"

clean:
	docker system prune -f
