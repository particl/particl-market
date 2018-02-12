#!/bin/sh
export NODE_ENV=$1
export APP_PORT=$2
export APP_HOST=$3
export RPCUSER=$4
export RPCPASSWORD=$5
export RPCHOSTNAME=$6
export MAINNET_PORT=$7
export TESTNET_PORT=$8

wait-port $APP_HOST:$APP_PORT/cli
npm run test:ui:pretty
