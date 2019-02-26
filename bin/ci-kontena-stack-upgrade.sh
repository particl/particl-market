#!/bin/sh
set -e

if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "Error!"
    echo ""
    echo "Usage: ./kontena-stack-upgrade.sh STACK_NAME CONFIG_FILE"
    exit 1
fi

STACK_NAME=$1
CONFIG_FILE=$2

echo "=============================================================="
echo "STACK_NAME: $STACK_NAME"
echo "CONFIG_FILE: $CONFIG_FILE"
echo "=============================================================="
echo "KONTENA_SERVER_URL: $KONTENA_SERVER_URL"
echo "KONTENA_SERVER_NAME: $KONTENA_SERVER_NAME"
echo "KONTENA_SERVER_USERNAME: $KONTENA_SERVER_USERNAME"
echo "KONTENA_SERVER_GRID: $KONTENA_SERVER_GRID"
echo "KONTENA_SERVER_TOKEN: $KONTENA_SERVER_TOKEN"
echo "KONTENA_ACCOUNT_NAME: $KONTENA_ACCOUNT_NAME"
echo "KONTENA_ACCOUNT_USERNAME: $KONTENA_ACCOUNT_USERNAME"
echo "KONTENA_ACCOUNT_TOKEN: $KONTENA_ACCOUNT_TOKEN"
echo "KONTENA_ACCOUNT_REFRESH_TOKEN: $KONTENA_ACCOUNT_REFRESH_TOKEN"
echo "=============================================================="

cat > /root/.kontena/certs/master.rutherford.in.pem <<CERTS
-----BEGIN CERTIFICATE-----
${KONTENA_CERT}
-----END CERTIFICATE-----
-----BEGIN RSA PRIVATE KEY-----
${KONTENA_PK}
-----END RSA PRIVATE KEY-----
CERTS

sed -i "s|KONTENA_SERVER_URL|${KONTENA_SERVER_URL}|g" /root/.kontena_client.json
sed -i "s|KONTENA_SERVER_NAME|${KONTENA_SERVER_NAME}|g" /root/.kontena_client.json
sed -i "s|KONTENA_SERVER_USERNAME|${KONTENA_SERVER_USERNAME}|g" /root/.kontena_client.json
sed -i "s|KONTENA_SERVER_GRID|${KONTENA_SERVER_GRID}|g" /root/.kontena_client.json
sed -i "s|KONTENA_SERVER_TOKEN|${KONTENA_SERVER_TOKEN}|g" /root/.kontena_client.json
sed -i "s|KONTENA_ACCOUNT_NAME|${KONTENA_ACCOUNT_NAME}|g" /root/.kontena_client.json
sed -i "s|KONTENA_ACCOUNT_USERNAME|${KONTENA_ACCOUNT_USERNAME}|g" /root/.kontena_client.json
sed -i "s|KONTENA_ACCOUNT_TOKEN|${KONTENA_ACCOUNT_TOKEN}|g" /root/.kontena_client.json
sed -i "s|KONTENA_ACCOUNT_REFRESH_TOKEN|${KONTENA_ACCOUNT_REFRESH_TOKEN}|g" /root/.kontena_client.json

SSL_IGNORE_ERRORS=true kontena master use $KONTENA_SERVER_NAME
SSL_IGNORE_ERRORS=true kontena grid use $KONTENA_SERVER_GRID
SSL_IGNORE_ERRORS=true kontena stack rm --grid $KONTENA_SERVER_GRID --force $STACK_NAME
SSL_IGNORE_ERRORS=true kontena stack install --grid $KONTENA_SERVER_GRID --deploy $CONFIG_FILE

echo "restarting loadbalancerstack/internet_lb..."
echo "=============================================================="
SSL_IGNORE_ERRORS=true kontena service restart loadbalancerstack/internet-lb

echo "done."
