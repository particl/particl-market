#!/usr/bin/env bash
docker-compose -f docker-compose.yml rm -vf app1
docker-compose -f docker-compose.yml rm -vf app2
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up --remove-orphans
