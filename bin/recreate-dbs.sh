#!/bin/sh
rm -rf data/marketplace*db
rm -rf data/app1/marketplace*db
rm -rf data/app2/marketplace*db
npm run db:migrate
cp data/marketplace.db data/marketplace-test.db
cp data/marketplace.db data/app1/marketplace.db
cp data/marketplace.db data/app1/marketplace-test.db
cp data/marketplace.db data/app2/marketplace.db
cp data/marketplace.db data/app2/marketplace-test.db

