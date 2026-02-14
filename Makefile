# ===================================
# CECOR - Makefile Profissional
# ===================================

COMPOSE=docker compose
BACKEND_DIR=backend
FRONTEND_DIR=frontend

.PHONY: help up down logs backend frontend format clean restart

help:
	@echo "======== CECOR COMMAND CENTER ========"
	@echo " make up        -> Sobe ambiente Docker"
	@echo " make down      -> Derruba ambiente"
	@echo " make restart   -> Reinicia ambiente"
	@echo " make logs      -> Logs em tempo real"
	@echo " make backend   -> Roda backend local"
	@echo " make frontend  -> Roda frontend local"
	@echo " make format    -> Formata código"
	@echo " make clean     -> Limpa docker"
	@echo "======================================="

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f

backend:
	cd $(BACKEND_DIR) && go run cmd/api/main.go

frontend:
	cd $(FRONTEND_DIR) && npm start

format:
	cd $(BACKEND_DIR) && gofmt -w .
	cd $(FRONTEND_DIR) && npm run format

clean:
	docker system prune -f
