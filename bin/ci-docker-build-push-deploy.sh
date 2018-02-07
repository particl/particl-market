#!/bin/sh
echo "REGISTRY_USER $1"
echo "REGISTRY_PASS $2"
echo "TRAVIS_BRANCH $3"
echo "TRAVIS_PULL_REQUEST $4"
echo "IMAGE_NAME $5"
echo "IMAGE_TAG $6"

REGISTRY_USER=$1
REGISTRY_PASS=$2
TRAVIS_BRANCH=$3
TRAVIS_PULL_REQUEST=$4
IMAGE_NAME=$5
IMAGE_TAG=$6

docker login r.cfcr.io -u "$1" -p "$2"

if [ $TRAVIS_BRANCH == "master" && $TRAVIS_PULL_REQUEST == "false" ]; then
    docker build --pull --cache-from "$IMAGE_NAME" -t $IMAGE_NAME:master-f Dockerfile.ci .
    docker push $DOCKER_IMAGE:master
    docker run -d r.cfcr.io/ludx/codefresh-custom-runner ./kontena-stack-upgrade.sh ruth-master gridsteri dappshellmaster-stack git@github.com:particl/dapp-shell.git master kontena-master.yml
elif [ $TRAVIS_BRANCH == "develop" && $TRAVIS_PULL_REQUEST == "false" ]; then
    docker build --pull --cache-from "$IMAGE_NAME" -t $IMAGE_NAME:develop -f Dockerfile.ci .
    docker push $DOCKER_IMAGE:develop
    docker run -d r.cfcr.io/ludx/codefresh-custom-runner ./kontena-stack-upgrade.sh ruth-master gridsteri dappshelldev-stack git@github.com:particl/dapp-shell.git develop kontena-develop.yml
else
    docker build --pull --cache-from "$IMAGE_NAME" -t $IMAGE_NAME:$IMAGE_TAG -f Dockerfile.ci .
    docker push $IMAGE_NAME:$IMAGE_TAG
    docker run -d r.cfcr.io/ludx/codefresh-custom-runner ./kontena-stack-upgrade.sh ruth-master gridsteri dappshellfeature-stack git@github.com:particl/dapp-shell.git $TRAVIS_BRANCH kontena-feature.yml
fi

echo "done."
