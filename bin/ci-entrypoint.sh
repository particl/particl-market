#!/bin/sh
set -e

# clean up the db and uploads folder
rm -rf data/database/*
rm -rf data/uploads/*

# setup config files
cp -f .env.circle.app1 .env
cp -f .env.circle.test .env.test
cp -f .env.circle.blackbox.example .env.blackbox

yarn install --check-files
npm run serve
