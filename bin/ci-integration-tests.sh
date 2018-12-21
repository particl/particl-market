#!/bin/sh
set -e

# setup config files
cp -f .env.ci.app1 .env
cp -f .env.ci.test .env.test
cp -f .env.ci.blackbox .env.blackbox

yarn install --check-files
./dockerize -wait tcp://circle.particl.xyz:58935 -timeout 30s
npm run test:integration:pretty
