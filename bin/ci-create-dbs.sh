#!/bin/sh
rm -rf data/marketplace*db
npm run db:migrate
cp data/marketplace.db data/marketplace-test.db
