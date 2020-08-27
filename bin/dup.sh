#!/usr/bin/env bash
COMPOSE_HTTP_TIMEOUT=180 docker-compose -f docker-compose.yml up --remove-orphans
