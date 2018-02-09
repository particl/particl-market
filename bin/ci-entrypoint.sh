#!/bin/sh

#set -e
ls -al data
ls -al data/app1
ls -al data/app2

yarn install
rm -rf data/marketplace.db
rm -rf data/marketplace-test.db
npm run db:migrate
cp -rf data/marketplace.db data/marketplace-test.db
bin/ci-create-build-version.sh
npm run serve
