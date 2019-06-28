#!/bin/sh

echo "NODE:"
node --version
echo "NPM:"
npm --version
echo "YARN:"
yarn --version
ls -al /app
# yarn install --check-files
yarn install --force
# yarn remove omp-lib
# yarn add omp-lib
bin/ci-create-build-version.sh
yarn serve
