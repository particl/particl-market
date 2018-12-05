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

echo ".env:"
cat .env
echo ".env.test:"
cat .env.test

yarn install --check-files

# ./dockerize -wait $APP_HOST:$APP_PORT/cli -timeout 30s
# ./dockerize -wait tcp://$RPCHOSTNAME:$TESTNET_PORT -timeout 30s

npm run test:integration:pretty
