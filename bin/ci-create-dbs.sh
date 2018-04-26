#!/bin/sh
rm -rf data/database/marketplace*db
#rm -rf data/app1/database/marketplace*db
#rm -rf data/app2/database/marketplace*db
#mkdir -p data/app1
#mkdir -p data/app2
npm run db:migrate
cp data/database/marketplace.db data/database/marketplace-test.db
#cp data/database/marketplace.db data/app1/database/marketplace.db
#cp data/database/marketplace.db data/app1/database/marketplace-test.db
#cp data/database/marketplace.db data/app2/database/marketplace.db
#cp data/database/marketplace.db data/app2/database/marketplace-test.db
