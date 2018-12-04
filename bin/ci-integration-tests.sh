#!/bin/sh
set -e
#!/bin/sh

echo "NODE:"
node --version
echo "NPM:"
npm --version
echo "YARN:"
yarn --version

# setup config files
cp -f .env.circle.app1 .env
cp -f .env.circle.test .env.test
cp -f .env.blackbox.example .env.blackbox

yarn install --check-files

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

# ./dockerize -wait $APP_HOST:$APP_PORT/cli -timeout 30s

yarn install --check-files
npm run test:integration:pretty
