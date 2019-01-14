#!/bin/sh
set -e

# clean up the db and uploads folder
rm -rf data/database/*
rm -rf data/uploads/*

# setup config files
cp -f .env.ci.app1 .env
cp -f .env.ci.test .env.test
cp -f .env.ci.blackbox .env.blackbox

yarn install --check-files
npm run serve
