#!/bin/sh
mkdir -p data/app1
mkdir -p data/app2
rm -rf data/marketplace*db*
rm -rf data/app1/marketplace*db*
rm -rf data/app2/marketplace*db*
npm run db:migrate
cp data/marketplace.db data/marketplace-test.db
cp data/marketplace.db-shm data/marketplace-test.db-shm
cp data/marketplace.db-wal data/marketplace-test.db-wal
cp data/marketplace*db* data/app1/
cp data/marketplace*db* data/app2/
#scp data/marketplace.db root@dev.particl.xyz:data/dapp-shell-ci/marketplace.db
