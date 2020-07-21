#!/usr/bin/env bash
docker-compose -f docker-compose-dev.yml rm -vf app1
docker-compose -f docker-compose-dev.yml rm -vf app2
docker-compose -f docker-compose-dev.yml build --no-cache
docker-compose -f docker-compose-dev.yml up --remove-orphans
