#!/bin/sh

echo "NODE:"
node --version
echo "NPM:"
npm --version
echo "YARN:"
yarn --version
ls -al /app
yarn install --check-files
bin/ci-create-build-version.sh
yarn serve
