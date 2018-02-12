#!/bin/sh

#set -e
yarn install
rm -rf data/marketplace.db
rm -rf data/marketplace-test.db
npm run db:migrate
cp -rf data/marketplace.db data/marketplace-test.db
bin/ci-create-build-version.sh
npm run serve
