# ===================================
# CECOR - Makefile Profissional
# ===================================

COMPOSE=docker compose
BACKEND_DIR=backend
FRONTEND_DIR=frontend

.PHONY: help up down logs backend frontend format clean restart

help:
	@echo " make up           -> Sobe tudo (Docker)"
	@echo " make up-backend   -> Sobe backend + banco"
	@echo " make up-db        -> Sobe apenas o banco de dados"
	@echo " make down         -> Derruba ambiente"
	@echo " make restart      -> Reinicia ambiente"
	@echo " make logs         -> Logs em tempo real"
	@echo " make logs-backend -> Logs apenas do backend"
	@echo " make logs-db      -> Logs apenas do banco"
	@echo " make backend      -> Roda backend local (binário)"
	@echo " make frontend     -> Roda frontend local (binário)"
	@echo " make format       -> Formata código"
	@echo " make clean        -> Limpa docker"
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

clean:
	docker system prune -f
