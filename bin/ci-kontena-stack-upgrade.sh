#!/bin/sh
set -e

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ] || [ -z "$6" ]
  then
    echo "Error!"
    echo ""
    echo "Usage: ./kontena-stack-upgrade.sh MASTER_NAME GRID_NAME STACK_NAME GIT_REPOSITORY BRANCH_NAME CONFIG_FILE"
    exit 1
fi
MASTER_NAME=$1
GRID_NAME=$2
STACK_NAME=$3
GIT_REPOSITORY=$4
BRANCH_NAME=$5
CONFIG_FILE=$6

echo "=============================================================="
echo "MASTER_NAME: $MASTER_NAME"
echo "GRID_NAME: $GRID_NAME"
echo "STACK_NAME: $STACK_NAME"
echo "GIT_REPOSITORY: $GIT_REPOSITORY"
echo "BRANCH_NAME: $BRANCH_NAME"
echo "CONFIG_FILE: $CONFIG_FILE"
echo "=============================================================="


echo "=============================================================="
echo "KONTENA_CERT: $KONTENA_CERT"
echo "KONTENA_PK: $KONTENA_PK"
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

#sanitize semicolons, remove newlines, and replace multiple spaces with a single space
#ASDF=$(echo ${ASDF//;/%3B}|sed ':a;N;$!ba;s/\n/ /g'|tr -s ' ')

cat > /root/.kontena/certs/master.rutherford.in.pem <<CERTS
-----BEGIN CERTIFICATE-----
KONTENA_CERT
-----END CERTIFICATE-----
-----BEGIN RSA PRIVATE KEY-----
KONTENA_PK
-----END RSA PRIVATE KEY-----
CERTS
sed -i "" "s|KONTENA_CERT|${KONTENA_CERT}|g" /root/.kontena/certs/master.rutherford.in.pem
sed -i "" "s|KONTENA_PK|${KONTENA_PK}|g" /root/.kontena/certs/master.rutherford.in.pem

echo "=============================================================="
ls -al ~/.kontena/certs/
cat /root/.kontena/certs/master.rutherford.in.pem
echo "=============================================================="

sed -i "" "s|KONTENA_SERVER_URL|${KONTENA_SERVER_URL}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_SERVER_NAME|${KONTENA_SERVER_NAME}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_SERVER_USERNAME|${KONTENA_SERVER_USERNAME}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_SERVER_GRID|${KONTENA_SERVER_GRID}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_SERVER_TOKEN|${KONTENA_SERVER_TOKEN}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_ACCOUNT_NAME|${KONTENA_ACCOUNT_NAME}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_ACCOUNT_USERNAME|${KONTENA_ACCOUNT_USERNAME}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_ACCOUNT_TOKEN|${KONTENA_ACCOUNT_TOKEN}|g" /root/.kontena_client.json
sed -i "" "s|KONTENA_ACCOUNT_REFRESH_TOKEN|${KONTENA_ACCOUNT_REFRESH_TOKEN}|g" /root/.kontena_client.json

echo "=============================================================="
cat /root/.kontena_client.json
echo "=============================================================="

echo "=============================================================="
echo "MASTER_NAME: $MASTER_NAME"
echo "GRID_NAME: $GRID_NAME"
echo "STACK_NAME: $STACK_NAME"
echo "GIT_REPOSITORY: $GIT_REPOSITORY"
echo "BRANCH_NAME: $BRANCH_NAME"
echo "=============================================================="

echo "--------------------------------------------"
echo "selecting master..."
echo "--------------------------------------------"
SSL_IGNORE_ERRORS=true kontena master use $MASTER_NAME

echo "--------------------------------------------"
echo "selecting grid..."
echo "--------------------------------------------"
SSL_IGNORE_ERRORS=true kontena grid use $GRID_NAME

echo "--------------------------------------------"
echo "upgrading stack..."
echo "--------------------------------------------"
kontena stack rm --grid $GRID_NAME --force $STACK_NAME
kontena stack install --grid $GRID_NAME --deploy $CONFIG_FILE

echo "--------------------------------------------"
echo "restarting loadbalancerstack/internet_lb..."
echo "--------------------------------------------"
SSL_IGNORE_ERRORS=true kontena service restart loadbalancerstack/internet-lb

echo "done."
