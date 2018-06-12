#!/bin/sh

#set -e
yarn install
rm -rf data/database/marketplace.db
rm -rf data/database/marketplace-test.db
npm run db:migrate
cp -rf data/database/marketplace.db data/database/marketplace-test.db
bin/ci-create-build-version.sh
npm run serve
