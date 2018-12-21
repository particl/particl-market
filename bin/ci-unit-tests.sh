#!/bin/sh
set -e

# setup config files
cp -f .env.circle.app1 .env
cp -f .env.circle.test .env.test
cp -f .env.circle.blackbox .env.blackbox

echo '---------------------------------------------------------------'
npm -v
echo '---------------------------------------------------------------'
yarn install --check-files
npm test
