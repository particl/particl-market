#!/bin/sh
mkdir -p data/app1/database
mkdir -p data/app2/database
rm -rf data/database/marketplace*db*
rm -rf data/tests/database/marketplace*db*
rm -rf data/app1/database/marketplace*db*
rm -rf data/app2/database/marketplace*db*
echo "removed dbs."
