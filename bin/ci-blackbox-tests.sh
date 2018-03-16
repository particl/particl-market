#!/bin/sh
set -e
export NODE_ENV=$1
export APP_PORT=$2
export APP_HOST=$3
export RPCUSER=$4
export RPCPASSWORD=$5
export RPCHOSTNAME=$6
export MAINNET_PORT=$7
export TESTNET_PORT=$8

echo $NODE_ENV
echo $APP_PORT
echo $APP_HOST
echo $RPCUSER
echo $RPCPASSWORD
echo $RPCHOSTNAME
echo $MAINNET_PORT
echo $TESTNET_PORT

./dockerize -wait $APP_HOST:$APP_PORT/cli -timeout 30s
npm run test:black-box:pretty
