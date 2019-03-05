#!/usr/bin/env bash
cd data/particl1/testnet/blocks
ls -1 blk[0-9]*.dat | sort | xargs cat > bootstrap.dat
zip bootstrap.zip bootstrap.dat
rm -f bootstrap.dat
NOW=$(date +"%Y%m%d")
mv bootstrap.zip ../../../bootstrap-$NOW.zip
cd ../../../..

