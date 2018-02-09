#!/bin/sh

#set -e
bin/copy-env.sh
yarn install --force
bin/ci-create-dbs.sh
bin/ci-create-build-version.sh
npm run db:migrate
npm run serve
