#!/bin/sh
set -e

# todo other nodes
./dockerize -wait tcp://circle.particl.xyz:58935 -timeout 30s

npm run test:black-box:pretty
