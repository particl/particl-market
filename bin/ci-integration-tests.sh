#!/bin/sh
set -e

# setup config files
cp -f .env.circle.app1 .env
cp -f .env.circle.test .env.test
cp -f .env.circle.blackbox.example .env.blackbox

yarn install --check-files
./dockerize -wait tcp://circle.particl.xyz:58935 -timeout 30s
npm run test:integration:pretty
