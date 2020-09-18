#!/bin/sh

echo "NODE:"
node --version
echo "NPM:"
npm --version
echo "YARN:"
yarn --version
# ls -al /app

if [ ! -d "/app/node_modules/omp-lib" ]; then
  echo "missing /app/node_modules/omp-lib, running install..."
#  yarn install --check-files
  yarn install --force
fi

bin/create-build-version.sh
yarn serve
