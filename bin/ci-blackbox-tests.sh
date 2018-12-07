#!/bin/sh
set -e

# setup config files
cp -f .env.circle.app1 .env
cp -f .env.circle.test .env.test
cp -f .env.circle.blackbox.example .env.blackbox

yarn install --check-files

# wait until core rpc and the mp cli are up
./dockerize -wait tcp://circle.particl.xyz:58935 -timeout 60s
./dockerize -wait tcp://circle.particl.xyz:59935 -timeout 60s
./dockerize -wait http://circle.particl.xyz:3100/cli/ -timeout 120s
./dockerize -wait http://circle.particl.xyz:3200/cli/ -timeout 120s

npm run test:black-box:pretty
