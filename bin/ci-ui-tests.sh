#!/bin/sh
set -e

# setup config files
cp -f .env.circle.app1 .env
cp -f .env.circle.test .env.test
cp -f .env.blackbox.example .env.blackbox

#yarn install --check-files
npm run test:ui:pretty
