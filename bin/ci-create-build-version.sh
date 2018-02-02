#!/bin/sh
VERSION="$(git log -n 1 --date=short --format=format:"rev.%ad.%h" HEAD)"
echo "{\"version\": \"$VERSION\"}" > public/cli/build.json
