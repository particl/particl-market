#!/bin/sh

#set -e
yarn install
bin/copy-env.sh
bin/ci-create-dbs.sh
bin/ci-create-build-version.sh
npm run db:migrate
npm run serve
