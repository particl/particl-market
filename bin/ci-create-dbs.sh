#!/bin/sh
mkdir -p data/database
rm -rf data/database/marketplace*db*

npm run db:migrate
cp data/database/marketplace.db data/database/marketplace-test.db
cp data/database/marketplace.db-shm data/database/marketplace-test.db-shm
cp data/database/marketplace.db-wal data/database/marketplace-test.db-wal

echo ""
echo "local app db:"
ls -al data/database

