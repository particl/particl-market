#!/bin/sh
set -e

cp -rf package.docs.json package.json
rm -rf yarn.lock
yarn install
yarn docs:serve 4567 "./docs" false
