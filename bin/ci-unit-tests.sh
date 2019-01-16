#!/bin/sh
set -e

# setup config files
cp -f .env.ci.app1 .env
cp -f .env.ci.test .env.test
cp -f .env.ci.blackbox .env.blackbox

echo '---------------------------------------------------------------'
npm -v
echo '---------------------------------------------------------------'
yarn install --check-files
npm test
