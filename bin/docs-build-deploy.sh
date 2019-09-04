#!/bin/sh
set -e

if [ -z "$1" ]
  then
    echo "Error!"
    echo ""
    echo "Usage: ./docs-build-deploy.sh TAG"
    exit 1
fi
TAG=$1

docker build -t particl-docs:latest -t docker.io/ludx/particl-docs:latest -t docker.io/ludx/particl-docs:$TAG -f Dockerfile.docs .
docker push docker.io/ludx/particl-docs:$TAG
docker push docker.io/ludx/particl-docs:latest

kontena stack rm --force market-docs-stack
sleep 5
kontena stack install kontena-docs.yml
sleep 5
kontena stack logs -f --tail 1000 market-docs-stack
