# ===================================
# CECOR - Backend Docker Helper
# ===================================

COMPOSE=docker compose -f ../docker-compose.yml

.PHONY: up logs down restart clean

up:
	$(COMPOSE) up --build -d backend

logs:
	$(COMPOSE) logs -f backend

down:
	$(COMPOSE) stop backend

restart:
	$(COMPOSE) restart backend

clean:
	$(COMPOSE) rm -f backend