#!/bin/sh
BRANCH=$(git branch | awk '/\*/ { print $2; }')
VERSION_START="$(git log -n 1 --date=short --format=format:"rev.%ad." HEAD)"
VERSION_END="$(git log -n 1 --date=short --format=format:".%H" HEAD)"
echo "{\"version\": \"$VERSION_START$BRANCH$VERSION_END\"}" > public/cli/build.json
