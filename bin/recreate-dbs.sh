#!/bin/sh
mkdir -p data/app1/database
mkdir -p data/app2/database
rm -rf data/database/marketplace*db*
rm -rf data/app1/database/marketplace*db*
rm -rf data/app2/database/marketplace*db*
#./node_modules/.bin/knex migrate:latest
npm run db:migrate
cp data/database/marketplace.db data/database/marketplace-test.db
cp data/database/marketplace.db-shm data/database/marketplace-test.db-shm
cp data/database/marketplace.db-wal data/database/marketplace-test.db-wal
cp data/database/marketplace*db* data/app1/database/
cp data/database/marketplace*db* data/app2/database/
#scp data/database/marketplace.db root@dev.particl.xyz:data/dapp-shell-ci/marketplace.db
echo ""
echo "docker app1 db:"
ls -al data/app1/database
echo ""
echo "docker app2 db:"
ls -al data/app2/database
echo ""
echo "local app db:"
ls -al data/database

